#!/usr/bin/env bash
# Full local platform via ArgoCD (ADR-0004, ADR-0016) — backs `mise run cluster:full`.
# The heavy lifting
# (CRD→operator→instance ordering, secret materialisation, sync waves) is ArgoCD's
# job, the same tool prod runs; this script only does what Argo cannot bootstrap:
# create the cluster, install the CNI + Argo itself, plant the SOPS decryption key,
# apply the local root-app, then wait and wire the host-specific edge tail.
#
# Baseline (choice a): Argo syncs committed master from GitHub — CI-built images,
# identical to prod. To iterate on uncommitted code/infra, see service:deploy /
# platform:deploy, or point the local root-app targetRevision at a pushed branch.
#
# Teardown: mise run cluster:stop (stop) / mise run cluster:delete (delete).
set -euo pipefail

CLUSTER="${CLUSTER:-platform}"
NS="platform"
DOMAIN="${DOMAIN:-dev.localtest.me}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

k() { kubectl --context "k3d-${CLUSTER}" "$@"; }
h() { helm --kube-context "k3d-${CLUSTER}" "$@"; }
# argocd CLI in core mode: talks straight to the Application CRDs (no `argocd
# login` / argocd-server, ADR-0004). Core mode derives the install namespace from
# the kube-context, so it runs against a throwaway kubeconfig pinned to `argocd`
# (set up in step 5) rather than mutating the user's real context.
ac() { KUBECONFIG="$AC_KUBECONFIG" argocd --core "$@"; }

# 1. Cluster + CNI (a CNI must exist before Argo's pods can schedule).
bash scripts/cluster-ensure.sh
bash scripts/cilium-install.sh

# 2. ArgoCD (it cannot sync itself into existence). Excluded from the local
#    platform ApplicationSet, so this imperative release is authoritative.
echo "→ installing ArgoCD"
helm dependency update infra/helm/platform/argocd >/dev/null
h upgrade --install argocd infra/helm/platform/argocd -n argocd --create-namespace --timeout 8m
k -n argocd rollout status deploy/argocd-server --timeout=300s
k -n argocd rollout status deploy/argocd-repo-server --timeout=300s
k -n argocd rollout status deploy/argocd-applicationset-controller --timeout=300s

# 3. SOPS decryption key (the bootstrap root of trust): the committed throwaway
#    local age key, planted as the Secret the sops-operator mounts (ADR-0005).
echo "→ planting sops-age-key (local throwaway key)"
k create namespace "$NS" --dry-run=client -o yaml | k apply -f -
k -n "$NS" create secret generic sops-age-key \
  --from-file=keys.txt=infra/gitops/platform/local/age.key \
  --dry-run=client -o yaml | k apply -f -

# 3b. Grafana mounts the `grafana-dashboards` ConfigMap (observability chart values
#     dashboardsConfigMaps.default) built from the committed dashboards at
#     infra/observability/dashboards/ (ADR-0011, kept outside the chart). The chart
#     does not create it, so materialise it before Argo starts Grafana; untracked by
#     Argo, so selfHeal/prune leave it alone.
echo "→ materialising grafana-dashboards ConfigMap"
k -n "$NS" create configmap grafana-dashboards \
  --from-file=infra/observability/dashboards/ \
  --dry-run=client -o yaml | k apply -f -

# 3c. Build + push repo images to the local registry — the local stand-in for CI.
#     Argo then deploys services + lowdefy from the registry exactly as prod pulls
#     from ghcr; the only difference is the registry host in the values overlay
#     (ADR-0016). Must run before step 4 so images exist before Argo creates pods.
#     Build args mirror scripts/service-deploy.sh.
REG="k3d-registry.localhost:5000"
build_push() {  # <image-name> <dockerfile> <context> [extra docker build args…]
  local name="$1" dockerfile="$2" context="$3"; shift 3
  docker build -t "${REG}/${name}:local" -f "$dockerfile" "$@" "$context"
  docker push "${REG}/${name}:local"
}
echo "→ building + pushing repo images to ${REG}"
for svc in authz catalog orders orgs payment; do
  build_push "${svc}-server" "services/${svc}/Dockerfile" . \
    --build-arg SERVICE="${svc}" --build-arg APP_CMD=server
done
for svc in orders payment; do
  build_push "${svc}-worker" "services/${svc}/Dockerfile" . \
    --build-arg SERVICE="${svc}" --build-arg APP_CMD=worker
done
build_push admin apps/admin/Dockerfile apps/admin

# 4. Local root App-of-Apps → Argo discovers the local appsets + apps from git.
echo "→ applying local root application"
k apply -f infra/gitops/bootstrap-local/root-application-local.yaml

# 5. Wait for Argo to converge with `argocd app wait` — it blocks in the
#    foreground, streams per-resource sync/health as it changes, and exits
#    non-zero with the offending resource the moment a sync operation fails
#    (no silent wait to the timeout). Two phases because apps are generated
#    asynchronously: first the root app (its 2 child apps + 2 appsets), then
#    every app the appsets produced. Appset generation lags appset sync, so the
#    set is re-listed until stable.
echo "→ waiting for ArgoCD to converge (this is a full platform; first run is slow)…"
AC_KUBECONFIG="$(mktemp)"
trap 'rm -f "$AC_KUBECONFIG"' EXIT
k config view --minify --flatten >"$AC_KUBECONFIG"
kubectl --kubeconfig "$AC_KUBECONFIG" config set-context --current --namespace argocd >/dev/null
ac app wait root-local --sync --health --operation --timeout 600
while :; do
  apps="$(ac app list -o name)"
  # shellcheck disable=SC2086  # names are newline-separated, intentional split
  ac app wait $apps --sync --health --operation --timeout 1800
  [ "$(ac app list -o name)" = "$apps" ] && break
done
echo "✓ all ArgoCD applications Synced + Healthy"

# 6. Host-specific edge tail (cannot be GitOps — depends on per-machine state):
#    local Traefik tuning, the /auth + landing routes to a host-run frontend, and
#    the frontend-dev EndpointSlice pointing at the docker-bridge gateway IP.
echo "→ applying host-specific edge glue"
k apply -f infra/local/traefik-config.yaml
k apply -f infra/local/edge-auth.yaml
GW="$(docker inspect "k3d-${CLUSTER}-server-0" \
  --format '{{range .NetworkSettings.Networks}}{{.Gateway}}{{end}}')"
k apply -f - <<EOF
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: frontend-dev
  namespace: ${NS}
  labels:
    kubernetes.io/service-name: frontend-dev
addressType: IPv4
ports:
  - name: http
    port: 3000
    protocol: TCP
endpoints:
  - addresses: ["${GW}"]
    conditions: { ready: true }
EOF

cat <<EOF

✓ cluster:full up (ArgoCD-driven from master).
  Product (Traefik):  https://${DOMAIN}:8443/api/<service>/   (self-signed TLS)
  Ops tier (ADR-0017, one origin per tool, AAL2 operator session required):
    Grafana:          https://grafana.ops.${DOMAIN}:8443/
    Hubble UI:        https://hubble.ops.${DOMAIN}:8443/
    Temporal UI:      https://temporal.ops.${DOMAIN}:8443/
    MinIO console:    https://minio.ops.${DOMAIN}:8443/
    Lowdefy console:  https://console.ops.${DOMAIN}:8443/
  Frontend:           run it natively on :3000 (the frontend-dev EndpointSlice
                      routes /auth + landing to the host).
  Diagnose:           argocd --core --kube-context k3d-${CLUSTER} app get <app>
                      UI: kubectl -n argocd port-forward svc/argocd-server 8080:443
  Teardown:           mise run cluster:stop  (keep cache) / cluster:delete (delete)
EOF

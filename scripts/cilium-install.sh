#!/usr/bin/env bash
# Install Cilium as the CNI on the local cluster (ADR-0003). A CNI must exist
# before any pod (including ArgoCD) can schedule, so this runs imperatively for
# both local tiers and is excluded from the local platform ApplicationSet. k3d
# keeps kube-proxy, so kubeProxyReplacement is off; one operator replica (the
# default 2 needs 2 nodes for anti-affinity). Idempotent (helm upgrade --install).
set -euo pipefail

CLUSTER="${CLUSTER:-platform}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

k() { kubectl --context "k3d-${CLUSTER}" "$@"; }
h() { helm --kube-context "k3d-${CLUSTER}" "$@"; }

# Already up? (helm release present and node Ready) → nothing to do.
if h -n kube-system status cilium >/dev/null 2>&1 \
   && k get node -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}' 2>/dev/null | grep -q True; then
  echo "✓ Cilium already installed and node Ready"
  exit 0
fi

SERVER_IP="$(k get node -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')"
echo "→ installing Cilium (apiserver ${SERVER_IP}:6443)"
helm dependency update infra/helm/platform/cilium >/dev/null

# Proxy-only workaround: behind an egress proxy the cilium agent's large image
# layer reliably truncates (containerd single-stream pull), wedging the CNI and
# leaving the node NotReady. So ONLY when a proxy is set: reference the agent by
# tag (useDigest=false) and pre-pull+import it on the host (docker resumes/retries).
CILIUM_ARGS=()
host_proxy="${HTTPS_PROXY:-${https_proxy:-}}"
if [ -n "$host_proxy" ]; then
  CILIUM_ARGS+=(--set cilium.image.useDigest=false)
  cilium_img="$(helm template cilium infra/helm/platform/cilium \
    --set cilium.image.useDigest=false 2>/dev/null \
    | grep -oE 'quay\.io/cilium/cilium:[A-Za-z0-9._-]+' | head -1)"
  if [ -n "$cilium_img" ]; then
    echo "→ pre-pulling ${cilium_img} on host + importing (proxy truncation workaround)"
    docker pull "$cilium_img"
    k3d image import "$cilium_img" -c "$CLUSTER"
  fi
fi

h upgrade --install cilium infra/helm/platform/cilium -n kube-system \
  --set cilium.kubeProxyReplacement=false \
  --set cilium.k8sServiceHost="${SERVER_IP}" \
  --set cilium.k8sServicePort=6443 \
  --set cilium.operator.replicas=1 \
  "${CILIUM_ARGS[@]}" \
  --timeout 5m

echo "→ waiting for the node to go Ready (Cilium up)…"
k wait --for=condition=Ready node --all --timeout=600s
echo "✓ Cilium installed; node Ready"

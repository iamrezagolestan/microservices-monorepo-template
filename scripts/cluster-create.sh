#!/usr/bin/env bash
# Create (or resume) the single local k3d cluster (ADR-0003, ADR-0016). One
# cluster serves both local tiers; what differs is what you bring up on it:
#   mise run cluster:up     → inner loop (lightweight deps, run services natively)
#   mise run cluster:full   → full platform via ArgoCD
#
# Flannel + the built-in network policy are disabled because the full tier runs
# Cilium as the CNI (NetworkPolicy + Hubble, ADR-0003); the inner loop installs a
# minimal Cilium too so there is always a CNI. Traefik stays (it provides the
# IngressRoute/Middleware CRDs the edge uses). Ports 8080/8443 map the loadbalancer.
set -euo pipefail

CLUSTER="${CLUSTER:-platform}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# If the host routes egress through a loopback HTTP proxy (some sandboxes do, and
# some registries 403 on digest pulls without it), point the node's containerd at
# it via host.k3d.internal so in-cluster pulls — including ArgoCD-synced workloads
# — go through it. No proxy on the host → these stay empty (normal laptop path).
PROXY_ARGS=()
host_proxy="${HTTPS_PROXY:-${https_proxy:-}}"
if [ -n "$host_proxy" ]; then
  node_proxy="$(printf '%s' "$host_proxy" | sed -E 's#(127\.0\.0\.1|localhost)#host.k3d.internal#')"
  case "$node_proxy" in *://*) ;; *) node_proxy="http://${node_proxy}" ;; esac
  no_proxy="10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.svc.cluster.local,cluster.local,127.0.0.1,localhost,host.k3d.internal,.localtest.me"
  echo "→ routing node image pulls through proxy ${node_proxy}"
  PROXY_ARGS=(
    --env "HTTP_PROXY=${node_proxy}@server:*"
    --env "HTTPS_PROXY=${node_proxy}@server:*"
    --env "NO_PROXY=${no_proxy}@server:*"
  )
fi

if ! k3d cluster list 2>/dev/null | awk '{print $1}' | grep -qx "$CLUSTER"; then
  echo "→ creating k3d cluster '$CLUSTER'"
  k3d cluster create "$CLUSTER" \
    --servers 1 --agents 0 \
    --port "8080:80@loadbalancer" --port "8443:443@loadbalancer" \
    --k3s-arg "--disable=traefik@server:0" \
    --k3s-arg '--flannel-backend=none@server:*' \
    --k3s-arg '--disable-network-policy@server:*' \
    --k3s-arg '--kubelet-arg=eviction-hard=imagefs.available<5%,nodefs.available<5%@server:*' \
    "${PROXY_ARGS[@]}"
else
  # `cluster:down` only STOPS the cluster (keeping the image cache + volumes), so
  # resume it here — a no-op if already running. `cluster:purge` deletes it.
  echo "→ cluster '$CLUSTER' exists; ensuring it is started"
  k3d cluster start "$CLUSTER" || true
fi
kubectl config use-context "k3d-${CLUSTER}"

# Docker rewrites the node's /etc/hosts on every start, dropping the
# host.k3d.internal entry the proxy path needs; re-assert it idempotently so pulls
# keep working after a host/Docker restart.
if [ -n "$host_proxy" ]; then
  for node in $(docker ps --format '{{.Names}}' --filter "label=k3d.cluster=${CLUSTER}"); do
    gw="$(docker inspect "$node" --format '{{range .NetworkSettings.Networks}}{{.Gateway}}{{end}}')"
    docker exec "$node" sh -c \
      "grep -q host.k3d.internal /etc/hosts || echo '${gw} host.k3d.internal' >> /etc/hosts" || true
  done
fi

echo "✓ cluster '$CLUSTER' ready (context k3d-${CLUSTER})"

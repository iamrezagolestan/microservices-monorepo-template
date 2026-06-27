#!/usr/bin/env bash
# Create the local k3d cluster and the lightweight dev dependencies (ADR-0003).
# The inner loop itself is `skaffold dev` (mise run dev). The full platform is
# delivered by ArgoCD in staging/prod, not here.
set -euo pipefail

CLUSTER="platform-dev"

if ! k3d cluster list 2>/dev/null | awk '{print $1}' | grep -qx "$CLUSTER"; then
  echo "→ creating k3d cluster '$CLUSTER'"
  k3d cluster create "$CLUSTER" \
    --servers 1 --agents 0 \
    --port "80:80@loadbalancer" --port "443:443@loadbalancer" \
    --k3s-arg "--disable=traefik@server:0" \
    --k3s-arg '--kubelet-arg=eviction-hard=imagefs.available<5%,nodefs.available<5%@server:*'
else
  # Cluster already exists. `cluster:down` only STOPS it (keeping the node's
  # image cache), so resume it here — a no-op if it is already running.
  echo "→ cluster '$CLUSTER' exists; ensuring it is started"
  k3d cluster start "$CLUSTER" || true
fi

kubectl config use-context "k3d-${CLUSTER}"

echo "→ applying lightweight dev dependencies (Postgres, Temporal, SpiceDB)"
kubectl apply -f infra/local/deps.yaml
kubectl -n platform rollout status deploy/postgres --timeout=120s

echo "✓ cluster:up complete — now run 'mise run dev' (skaffold dev) to build & run services"

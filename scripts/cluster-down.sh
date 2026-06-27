#!/usr/bin/env bash
# Stop the local k3d cluster (ADR-0003) — WITHOUT destroying it. Stop `skaffold
# dev` first (Ctrl-C) to remove the deployed services. `k3d cluster stop` halts
# the node container but keeps it, so the node's containerd image cache and
# volumes survive; `mise run cluster:up` then resumes it with no cold image
# re-pulls — which matters a lot behind a slow/restricted egress proxy.
set -euo pipefail
CLUSTER="platform-dev"

if k3d cluster list 2>/dev/null | awk '{print $1}' | grep -qx "$CLUSTER"; then
  echo "→ stopping k3d cluster '$CLUSTER' (image cache preserved)"
  k3d cluster stop "$CLUSTER"
  echo "✓ cluster:down complete — resume with 'mise run cluster:up'."
else
  echo "cluster '$CLUSTER' not found — nothing to do"
fi

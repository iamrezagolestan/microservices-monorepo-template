#!/usr/bin/env bash
# Heal a local k3d cluster after a host reboot (ADR-0003).
#
# Docker's restart policy on the k3d node is `unless-stopped`, so on daemon start
# (after a reboot) Docker replays the node container RAW — without k3d's own start
# orchestration. That skips the step where k3d injects the `host.k3d.internal`
# alias + CoreDNS records, so on a proxied machine the node's proxy target becomes
# unresolvable: containerd can't pull the pause/CNI images, Cilium never comes up,
# and every pod hangs in ContainerCreating cluster-wide. `k3d cluster stop && start`
# is the fix — the start path re-injects the alias — so this wraps that as a
# one-liner. Idempotent and safe to run anytime the cluster looks wedged after a
# reboot. See docs/dev-loop.md ("After a reboot").
set -euo pipefail
CLUSTER="${CLUSTER:-platform}"

if ! k3d cluster list | awk '{print $1}' | grep -qx "$CLUSTER"; then
  echo "cluster '$CLUSTER' not found — nothing to heal (run 'mise run cluster:full')"
  exit 0
fi

echo "→ healing '$CLUSTER': stop + start to re-inject host.k3d.internal + CoreDNS records"
k3d cluster stop "$CLUSTER"
k3d cluster start "$CLUSTER"

# Confirm the alias is actually back — the whole point of the dance.
if docker exec "k3d-${CLUSTER}-server-0" grep -q host.k3d.internal /etc/hosts; then
  echo "✓ host.k3d.internal restored; pods will reschedule as Cilium recovers"
else
  echo "✗ host.k3d.internal still missing after restart — investigate k3d/CoreDNS" >&2
  exit 1
fi

#!/usr/bin/env bash
# Unwedge image pulls stalled by an HTTP proxy (OPT-IN, proxied networks only).
#
# The normal bring-up is proxy-free: on a clean network every image pulls fine and
# you never need this. Behind a corporate proxy, though, the k3d node's containerd
# pulls public-registry images (cilium, argocd, authzed/zed, …) THROUGH privoxy,
# which times out on large TLS blobs and can wedge the pull indefinitely — pods sit
# in ImagePullBackOff / ErrImagePull. See docs/dev-loop.md ("HTTP proxies").
#
# This does the documented manual recovery, automatically and only for what is
# actually stuck: host `docker pull` (the host proxy handles blobs fine) → then
# `k3d image import` into the node's containerd → then delete the stuck pod so it
# retries against the now-local image. Nothing is hardcoded, so it tracks chart
# image bumps and covers whatever the proxy happened to choke on this run.
#
#   mise run cluster:unwedge          # one pass
#   watch -n15 mise run cluster:unwedge   # or loop while a fresh cluster:full converges
#
# The repo's default path never calls this — it exists solely so a proxied machine
# has a working, explicit escape hatch without polluting the clean-network setup.
set -euo pipefail

CLUSTER="${CLUSTER:-platform}"
k() { kubectl --context "k3d-${CLUSTER}" "$@"; }

# Every image referenced by a container that is currently failing to pull, across
# all namespaces — init and regular containers alike. `waiting.reason` is the
# authoritative signal (ImagePullBackOff/ErrImagePull); dedupe since one image can
# wedge many pods.
readarray -t stuck < <(
  k get pods -A -o json \
    | jq -r '
        .items[].status
        | (.initContainerStatuses // []) + (.containerStatuses // [])
        | .[]
        | select(.state.waiting.reason // "" | test("ImagePull|ErrImagePull"))
        | .image
      ' \
    | sort -u
)

if [ "${#stuck[@]}" -eq 0 ]; then
  echo "✓ no image pulls are stuck — nothing to unwedge"
  exit 0
fi

echo "→ ${#stuck[@]} image(s) stuck behind the proxy; pulling on the host + importing:"
for img in "${stuck[@]}"; do
  echo "  · $img"
  # Pull by the full, digest-pinned ref so we fetch exactly the bytes the pod wants.
  docker pull "$img"
  # k3d image import can't resolve a combined `repo:tag@sha256:…` ref (its runtime
  # lookup only matches plain tags), so strip the digest and import by tag. The
  # content digest is unchanged, so the digest-pinned pod still resolves it locally.
  import_ref="$img"
  if [[ "$img" == *"@sha256:"* ]]; then
    no_digest="${img%@sha256:*}"
    [[ "${no_digest##*/}" == *:* ]] && import_ref="$no_digest"
  fi
  k3d image import "$import_ref" -c "$CLUSTER"
done

# Nudge the stuck pods to retry now (delete Pending/waiting pods; their owners —
# Jobs, Deployments, DaemonSets — recreate them, which re-pulls and finds the image
# local). Only pods with a still-waiting pull container are touched.
echo "→ restarting pods that were waiting on those images"
k get pods -A -o json \
  | jq -r '
      .items[]
      | select(
          [ (.status.initContainerStatuses // []) + (.status.containerStatuses // [])
            | .[] | .state.waiting.reason // "" ]
          | any(test("ImagePull|ErrImagePull"))
        )
      | "\(.metadata.namespace) \(.metadata.name)"
    ' \
  | while read -r ns pod; do
      echo "  · $ns/$pod"
      k -n "$ns" delete pod "$pod" --wait=false
    done

echo "✓ imported ${#stuck[@]} image(s); pods will re-pull locally. Re-run if more wedge."

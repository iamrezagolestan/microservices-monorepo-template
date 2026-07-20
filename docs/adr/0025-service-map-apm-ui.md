# ADR-0025: Service Map & Application-Observability UI

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Platform team
- **Related:** [ADR-0000](0000-platform-foundations.md), [ADR-0003](0003-cluster-topology.md), [ADR-0004](0004-gitops.md), [ADR-0011](0011-observability.md), [ADR-0017](0017-url-and-domain-structure.md), [ADR-0024](0024-kubernetes-debug-ui.md)

## Context

[ADR-0003](0003-cluster-topology.md) deploys Cilium with **Hubble**, and originally
exposed the bundled **Hubble UI** as the cluster's network / service-map dashboard at
`network.ops.<host>`. Two problems surfaced in practice:

1. **Hubble UI collapses workloads by name.** Its service map derives a card's display
   name from `app.kubernetes.io/name` (via a hard-coded label set) and ignores
   `app.kubernetes.io/component`. Every role of a multi-component app therefore renders
   as one indistinguishable node — e.g. Temporal's `frontend`, `history`, `matching`,
   and `worker` all show as a single "temporal" card, separable only by port. For a
   platform that runs several such apps this makes the map hard to read.
2. **Hubble UI is effectively unmaintained.** The standalone `cilium/hubble-ui` has had
   no release since **v0.13.5 (Apr 2024)**; the naming limitation is a known, open,
   unfixed issue. Waiting on an upstream fix is not a plan.

The Hubble **flow engine** itself (agent + relay) is not the problem — it remains the
audit surface for internal header-trust ([ADR-0009](0009-api-gateway.md)) and the source
of network-flow metrics for Grafana, and is still reachable via the `hubble` CLI. Only
its stagnant *UI* is being replaced.

## Decision drivers

1. **A readable service map** that distinguishes every workload, including the roles of
   multi-component apps.
2. **Application-level observability**, not just L3/L4 flows — dependencies, RED metrics,
   traces, SLOs — to complement Grafana (signals) and Hubble flows (network).
3. **Consistent with the ops-tier pattern** ([ADR-0017](0017-url-and-domain-structure.md))
   — one origin, one edge gate, no new access model.
4. **Permissive licence, self-host, bounded footprint** ([ADR-0000](0000-platform-foundations.md)).

## Decision

- **Tool: Coroot Community Edition** (Apache-2.0). eBPF-based; a `node-agent` DaemonSet,
  a `cluster-agent`, the Coroot server, and its mandatory ClickHouse + Prometheus, wired
  by the `coroot-operator`. It keys every application by **Deployment**, so multi-role
  apps show as distinct nodes with real dependency edges — solving driver 1 directly.
- **Retire the Hubble UI.** `hubble.ui.enabled=false` in the Cilium values
  ([ADR-0003](0003-cluster-topology.md)); the Hubble agent + relay stay ON. The
  `network.ops` origin is freed (it described a network-flow view Coroot does not
  replace — reserve it for a future flow tool rather than mislabel Coroot with it).
- **Ops-tier origin `map.ops.<host>`**, behind the ops forward-auth: coarse `operator`
  claim + AAL2, plus the per-tool OpenFGA grant `dashboard:map#view`
  ([ADR-0017](0017-url-and-domain-structure.md)). The origin is named for the *concept*
  (`map`), not the product, per ADR-0017.
- **Its own `coroot` namespace.** Coroot's internal mesh (operator, agents, Prometheus,
  ClickHouse and its Keeper raft/replication) is broad; isolating it in a dedicated namespace
  behind one self-contained default-deny NetworkPolicy (blanket intra-namespace allow +
  DNS + API server + edge ingress) is far simpler and more robust than threading it into
  the `platform` default-deny mesh, and keeps its heavier footprint contained.
- **Edge is the auth boundary.** Coroot CE has no built-in SSO/RBAC (those are
  Enterprise-only); it runs anonymous-Admin *behind* the ops forward-auth, exactly like
  the other third-party ops dashboards ([ADR-0017](0017-url-and-domain-structure.md)).
- **All component images are pinned** in the Coroot CR. Left unset, the operator
  auto-updates each component to the latest tag from `ghcr.io/coroot` on every reconcile;
  pinning keeps deploys reproducible and lets an air-gapped adopter mirror an exact set.
- **Minimum-viable footprint** (template minimalism): single ClickHouse shard/replica and
  a single Keeper (no HA ensemble), 2-day Prometheus retention. An adopter scales these
  for durability.
- **Core component** ([docs/operational-surface.md](../operational-surface.md)): deployed
  in every environment via Helm + ArgoCD (a standalone `app-coroot` Application, not the
  platform ApplicationSet, because it targets its own namespace). Remove it like any Core
  part if a project does not want it.
- **Alternatives rejected:**
  - *Keep Hubble UI* — the naming defect is unfixed and the project is stagnant.
  - *Grafana + Hubble network-flow metrics only* — solves the naming problem for dashboards
    but gives no service map / APM / traces; adopted **in addition**, not instead
    ([ADR-0011](0011-observability.md)).
  - *Isovalent/Cisco Enterprise Hubble* — the maintained UI, but commercial.
  - *Coroot operator-less (`coroot-ce`) chart* — fewer moving parts, but the operator path
    is what was validated and cleanly manages the ClickHouse/Keeper topology.

## Consequences

### Positive

- The service map distinguishes every workload; multi-role apps (Temporal, etc.) read
  clearly, with real dependency edges.
- Adds application-level observability (RED metrics, traces, SLOs) alongside Grafana and
  Hubble flows, under one edge login — no new access model.
- Hubble's flow engine, CLI, and metrics are untouched; only the dead UI is gone.

### Negative / Risks

- **Footprint.** Coroot pulls a non-trivial stack (operator + two agents + ClickHouse +
  Keeper + Prometheus) — much heavier than the near-free Hubble UI. Contained in its own
  namespace and kept minimum-viable; an adopter who does not want it removes the Core part.
- **CE lacks SSO/RBAC** (Enterprise-only). The edge gate (Oathkeeper AAL2 + OpenFGA
  `dashboard:map#view`) is the auth boundary; within it Coroot is single-tenant Admin.
- **eBPF needs tracefs/debugfs on the node.** Real nodes mount these; a k3d "node" is a
  container that does not, so local bring-up mounts them into the node
  (`scripts/cluster-ensure.sh`). Non-issue in prod.
- **Phone-home.** CE checks `cloud.coroot.com` for updates; the namespace NetworkPolicy
  grants no external egress, so the check no-ops (air-gap safe).
- One more always-on stack to patch. Accepted as Core operational surface.

### Follow-ups

- `infra/helm/platform/coroot/` (vendored `coroot-operator` subchart + the Coroot CR +
  the namespace NetworkPolicy) and `infra/gitops/*/app-coroot.yaml`.
- `map.ops.<host>` IngressRoute + Oathkeeper `ops-map` rule + OpenFGA `dashboard:map` grant.
- Grafana + Hubble network-flow metrics dashboard ([ADR-0011](0011-observability.md)) —
  the complementary network view.

## Rules

- The service-map / application-observability UI is Coroot Community Edition (Apache-2.0),
  a Core component deployed via Helm + ArgoCD in its own `coroot` namespace, served at
  `map.ops.<host>` behind the ops forward-auth (operator claim + AAL2 + `dashboard:map#view`). `(review-only)`
- The standalone Hubble UI is not deployed; the Hubble agent + relay (flow engine, CLI,
  metrics — [ADR-0003](0003-cluster-topology.md)/[ADR-0009](0009-api-gateway.md)) stay on. `(review-only)`
- Coroot component images are pinned in the CR, never left to the operator's latest-tag
  auto-update. `(review-only)`

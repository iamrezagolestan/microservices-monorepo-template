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
- **Ops-tier origin `coroot.ops.<host>`**, behind the ops forward-auth: coarse `operator`
  claim + AAL2, plus the per-tool OpenFGA grant `dashboard:coroot#view`
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

### Coroot and Grafana: a sequence, not a split

Coroot and the Grafana/LGTM stack overlap, and two panels that appear to do the same thing is a
real operational cost. This is the entry point, and it belongs in `docs/dev-loop.md` too:

> **Start at `coroot.ops.<host>`** — *"is something wrong, and where?"* Service map, live RED,
> SLOs, continuous profiling, database health.
> **Escalate to `grafana.ops.<host>`** — *"what exactly happened, and to whom?"* Trace-stitched
> debugging, custom business metrics, browser RUM, network-policy drops, anything older than
> Coroot's retention.

Operators are not confused by "start here, then go there". They are confused by two tools that
both appear to own logs. State the order, not a feature comparison.

**The overlap is only two signals.** Service map, profiling, database health and SLOs live solely
in Coroot; custom business metrics, browser RUM and network-policy drops live solely in Grafana.
Only **container logs** and **traces** appear in both:

- *Logs* are genuinely duplicated — Coroot's node-agent reads container stdout via eBPF while the
  same lines reach Loki over OTLP. Coroot's copy is "what this container printed near the
  incident"; Loki's is "queryable history, correlated by `trace_id`".
- *Traces* stay deliberately different in **fidelity**: Coroot's are eBPF-inferred and
  connection-level; Grafana's are real OTLP spans with business context. Dual-shipping OTLP to
  Coroot was **considered and rejected** precisely because it would collapse that distinction into
  the same spans rendered twice, for doubled egress and storage.

### Why Coroot does not replace Grafana

Coroot is strong enough to raise the question, so the answer is recorded. Four blockers:

1. **No browser RUM.** Coroot is backend/infrastructure-focused and says so. The frontend ships
   Grafana Faro → `/api/rum` → Tempo/Loki ([ADR-0014](0014-frontend.md)); removing Grafana orphans
   that signal entirely. Keeping Faro without Grafana is not a partial win — it collects RUM data
   no remaining tool understands.
2. **Dashboards cannot be declared as code.** Coroot CE *does* have custom dashboards (PromQL,
   time-series panels), but they are created through the UI only. That is click-ops state in
   ClickHouse: not in git, not reviewable, not reproducible, lost on a namespace rebuild, and
   invisible to Argo. It contradicts [ADR-0004](0004-gitops.md) and this ADR-0011 rule directly:
   *"Dashboards live as JSON files under `infra/observability/dashboards/`. UI-only edits are not
   allowed; changes are PRs."*
3. **Coroot's OTLP ingest carries logs and traces only, not metrics** — so custom business counters
   (`catalog_products_created_total`) have no path into it.
4. **Durability and query surface.** Coroot retains ~7 days in ClickHouse, and its space manager
   drops below the configured TTL under disk pressure; Loki/Tempo are bucket-backed
   ([ADR-0003](0003-cluster-topology.md)). Coroot also exposes no stable query API for
   [ADR-0018](0018-testing-strategy.md)'s acceptance gauge, which asserts on PromQL/LogQL/TraceQL.

**Accepted duplication:** Coroot brings its own Prometheus and a ClickHouse, so the cluster runs two
Prometheus instances. This is deliberate. Do not "fix" it by merging them without reading the
external-Prometheus note in the follow-ups — the platform Prometheus is push-only by design.

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
  `dashboard:coroot#view`) is the auth boundary; within it Coroot is single-tenant Admin.
- **eBPF needs tracefs/debugfs on the node.** Real nodes mount these; a k3d "node" is a
  container that does not, so local bring-up mounts them into the node
  (`scripts/cluster-ensure.sh`). Non-issue in prod.
- **Phone-home.** CE checks `cloud.coroot.com` for updates; the namespace NetworkPolicy
  grants no external egress, so the check no-ops (air-gap safe).
- One more always-on stack to patch. Accepted as Core operational surface.

### Follow-ups

- `infra/helm/platform/coroot/` (vendored `coroot-operator` subchart + the Coroot CR +
  the namespace NetworkPolicy) and `infra/gitops/*/app-coroot.yaml`.
- `coroot.ops.<host>` IngressRoute + Oathkeeper `ops-coroot` rule + OpenFGA `dashboard:coroot` grant.
- Grafana + Hubble network-flow metrics dashboard ([ADR-0011](0011-observability.md)) —
  the complementary network view.

## Rules

- The service-map / application-observability UI is Coroot Community Edition (Apache-2.0),
  a Core component deployed via Helm + ArgoCD in its own `coroot` namespace, served at
  `coroot.ops.<host>` behind the ops forward-auth (operator claim + AAL2 + `dashboard:coroot#view`). `(review-only)`
- The standalone Hubble UI is not deployed; the Hubble agent + relay (flow engine, CLI,
  metrics — [ADR-0003](0003-cluster-topology.md)/[ADR-0009](0009-api-gateway.md)) stay on. `(review-only)`
- Coroot component images are pinned in the CR, never left to the operator's latest-tag
  auto-update. `(review-only)`

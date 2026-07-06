# ADR-0024: Kubernetes Debug UI

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Platform team
- **Related:** [ADR-0000](0000-platform-foundations.md), [ADR-0004](0004-gitops.md), [ADR-0011](0011-observability.md), [ADR-0017](0017-url-and-domain-structure.md)

## Context

The ops surfaces answer different questions: ArgoCD (what is deployed), Grafana (signals), Hubble
(network), Temporal (workflows). None does the k9s job — *what pods exist right now, describe them, tail
their logs, exec in, port-forward*. During an incident that gap is filled today by a laptop with
`kubectl`, which is fine for engineers with cluster access but leaves no shared, auth-gated view.

## Decision drivers

1. **A live pod-level view** that complements, not duplicates, the existing ops tools.
2. **Consistent with the ops-tier pattern** ([ADR-0017](0017-url-and-domain-structure.md)) — one origin,
   one gate, no new concepts.
3. **Does not fight GitOps** ([ADR-0000](0000-platform-foundations.md) principle 3): the cluster's desired
   state lives in Git, not in a UI a click can mutate.
4. **Self-host, low surface** ([ADR-0000](0000-platform-foundations.md)).

## Decision

- **Tool: Headlamp** (CNCF Sandbox, Apache-2.0). A single in-cluster deployment, OIDC/header aware, drops
  into the existing pattern as one more ops origin.
- **Ops-tier origin `k8s.ops.<host>`**, behind the ops forward-auth: coarse `operator` claim + AAL2, with
  the optional per-tool SpiceDB grant `dashboard:k8s#view` ([ADR-0017](0017-url-and-domain-structure.md)).
- **Read-mostly by default.** Headlamp runs with a **read-only ClusterRole** — list/get/watch, logs,
  describe, port-forward, and exec for diagnosis. It is a *debugging* surface, **not a control surface**:
  it does not create, edit, or delete reconciled resources. Desired state changes go through Git and
  ArgoCD ([ADR-0004](0004-gitops.md)). This scoping is what keeps it consistent with the "no clicking in
  UIs to persist state" principle.
- **Opt-in component** ([docs/operational-surface.md](../operational-surface.md)): flag-gated, off unless a
  project enables it.
- **Alternatives rejected:** k9s (excellent, but a TUI — no shared web origin, no edge gating); Kubernetes
  Dashboard (token-handling and past-CVE security baggage we do not want on an ops origin).

## Consequences

### Positive

- The k9s workflow gets a shared, auth-gated web home without a new access model — one row in the ops
  tier.
- Read-only-by-default means it cannot become a GitOps-bypassing control plane.
- During an incident, an operator reaches pods/logs/exec through the same login as every other dashboard.

### Negative / Risks

- Even read-only, logs and exec expose secrets-in-memory and sensitive output; access is therefore gated
  behind operator + AAL2, and exec is audited. A project needing tighter limits narrows the ClusterRole.
- One more Opt-in component to patch when enabled. Accepted; it ships off.

### Follow-ups

- `infra/helm/platform/headlamp/` with the read-only ClusterRole and the flag gate.
- `k8s.ops.<host>` IngressRoute + Oathkeeper rule ([docs/gateway/runbook.md](../gateway/runbook.md)).
- Optional `dashboard:k8s` grant in the SpiceDB schema for the fine per-tool layer.

## Rules

- The Kubernetes debug UI is Headlamp, deployed Opt-in via Helm + ArgoCD, served at `k8s.ops.<host>` behind
  the ops forward-auth (operator claim + AAL2). `(review-only)`
- Headlamp runs with a read-only ClusterRole by default; it is a debugging surface, not a control surface.
  Desired-state changes go through Git/ArgoCD, never the UI ([ADR-0004](0004-gitops.md)). `(review-only)`

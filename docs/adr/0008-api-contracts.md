# ADR-0008: API Contracts & Codegen

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Platform team
- **Related:** [ADR-0001](0001-language-and-runtime.md), [ADR-0009](0009-api-gateway.md), [ADR-0017](0017-url-and-domain-structure.md), [ADR-0022](0022-api-lifecycle.md)

## Context

Services expose APIs to three consumer groups:

1. **The Next.js frontend** ([ADR-0002](0002-monorepo.md)) — browser-side.
2. **Other internal services** — service-to-service via HTTP ([ADR-0006](0006-temporal.md)).
3. **Third-party / public API consumers** — external developers who require stable, documented contracts.

Identity is validated at the edge by Ory Oathkeeper ([ADR-0009](0009-api-gateway.md)) and workflow orchestration is Temporal ([ADR-0006](0006-temporal.md)).

We need:

- A single **source of truth** for every API surface.
- **Generated code** in both Go (server stubs and internal clients) and TypeScript (frontend client). No hand-written request/response types on either side.
- **Schema validation in the service**, generated from the same artifact — no hand-maintained validators.
- A workflow strict enough that contract drift cannot survive code review or CI.
- Coverage for streaming use cases (SSE common; bidirectional rare but possible).

Wire efficiency for internal calls is explicitly **not** a priority. JSON over HTTP everywhere. Operational simplicity, browser-friendliness, gateway-friendliness, and human-debuggability win over binary-protocol throughput at our scale.

## Decision drivers

1. **One contract, two languages.** Go server + TS client from the same artifact.
2. **Single validation surface.** One generated validator in the service, driven by the spec — no parallel edge-validation config to keep in sync.
3. **Public API readiness.** Third-party consumers expect OpenAPI docs and SDKs.
4. **Browser fit.** No special proxies, no Envoy sidecars, no `grpc-web`.
5. **Spec-first, enforced.** The spec leads. CI fails if generated code is stale or hand-written types shadow generated ones.

## Considered options

- **OpenAPI 3.1 + `ogen` + `openapi-typescript` + `openapi-fetch`** — one spec drives Go server, Go client, TS client, public docs, downloadable SDKs.
- **gRPC + `grpc-web`** — browsers need an Envoy/Connect proxy and lose streaming semantics; public consumers expect OpenAPI anyway.
- **Connect-RPC (Buf)** — speaks HTTP/JSON and gRPC simultaneously, but adds an RPC framework where plain OpenAPI/JSON already satisfies our browser, service, and public consumers. Revisit only if a binary-protocol need emerges.
- **GraphQL** — wrong fit for service-to-service and public-API consumers; gateway features are harder; adds a query planner an 8-person team cannot afford.
- **tRPC** — TS-only; our backend is Go.

## Decision

**The API contract source of truth is OpenAPI 3.1.** One spec per **resource-API** service at `services/<service>/openapi.yaml`. Each spec is **fully self-contained**: cross-service shapes (the error envelope, common ID/time types, the workflow handle from [ADR-0006](0006-temporal.md)) are declared in the spec's own `components` rather than imported from a shared `api/shared/` namespace by cross-file `$ref`. Keeping each spec self-contained (no external file references) makes specs portable across the codegen and linting tools and removes any cross-file resolution step, so these shapes are duplicated by convention and kept identical across services.

**Control-plane services are exempt.** The rule covers services that expose an HTTP **resource API** (the ones ogen generates a server + SDK for). A pure control-plane/decision service whose contract is defined elsewhere ships **no** `openapi.yaml`: the `authz` service ([ADR-0010](0010-auth.md)) is contract-defined by its SpiceDB schema, and its few endpoints (`/internal/authorize`, `/admin/*`) are hand-written on a plain mux with no generated SDK. `mise run gen` discovers specs by glob (`services/*/openapi.yaml`), so an absent spec simply yields no generated surface — adding one to a non-ogen service would only produce dead artifacts.

### Server URL & paths: flat resource namespace

Each spec's `servers` entry is the **shared flat prefix — `url: /api`** — and its paths are **globally-unique resource
nouns** (`/products`, `/orders`, `/charges`), so the exposed URL is `<host>/api/<resource>` with no service segment
([ADR-0017](0017-url-and-domain-structure.md)). The service that owns a resource is a hidden edge-routing detail, not part
of the URL. Because all specs share one `/api` namespace, two `x-audience`-exposed specs must not claim the same top-level
resource prefix; the vacuum lint fails on a collision. East-west, service-to-service endpoints (e.g. `/internal/*`) are
declared in the spec but bypass the edge ([ADR-0009](0009-api-gateway.md)) and are not part of the `/api` surface.

The API is **not versioned in the URL**: single-live-version by default, an `Api-Version` header only when online
versioning is flagged on ([ADR-0022](0022-api-lifecycle.md)) — which is precisely why the flat resource URL is stable.

### Codegen

| Output                      | Tool                                                   | Location                                               |
|-----------------------------|--------------------------------------------------------|--------------------------------------------------------|
| Go server + client + types  | `ogen` (type-safe, OpenTelemetry-instrumented)         | `libs/go/sdks/<service>/`                              |
| TS client                   | `openapi-typescript` + `openapi-fetch` (~6 KB runtime) | `libs/ts/sdks/<service>/`                              |
| Public SDKs                 | OpenAPI Generator                                      | published per-language as third-party consumers arrive |

All generated artifacts are committed to the repo and drift-checked in CI per [ADR-0002](0002-monorepo.md).

### Workflow

1. API change is a PR to `services/<service>/openapi.yaml`.
2. CI runs **vacuum** lint with the repo ruleset at `tools/codegen/openapi-ruleset.yaml` (style + breaking-change detection).
3. `mise run gen` regenerates Go server, Go client, and TS client.
4. CI fails if generated files are out of date (`git diff --exit-code`).
5. Hand-written code imports generated types and never declares parallel ones.

### Validation

- **The service** validates request schemas via `ogen`'s generated server, which decodes and validates every request into typed Go values. The validator is generated from the same spec; it costs nothing to maintain.
- **The service** owns all **business-rule** validation (ownership, limits, state transitions, idempotency).

Schema validation is **service-side only.** The edge ([ADR-0009](0009-api-gateway.md)) does not validate request bodies — internal service-to-service calls bypass it anyway, so the service is the one place that sees every request. `ogen`'s generated validator makes a second edge-validation layer redundant rather than defense-in-depth.

### Streaming

- **Server-Sent Events (SSE)** is the default for server→client push. Declared in OpenAPI as `text/event-stream` responses; Traefik passes through.
- **Server-streaming over HTTP/2** is used only when SSE is awkward (binary frames, very high throughput). Declared with a chunked-transfer response, documented per-endpoint.
- **WebSockets** for bidirectional streaming. Documented in `services/<service>/README.md` with a JSON-Schema for message envelopes. Treated as a deliberate exception: each WS endpoint needs a one-line justification in the README.
- Traefik handles WS upgrades. gRPC and Connect are not introduced for streaming.

### Authoring layer

OpenAPI YAML is hand-written. **TypeSpec is not used.** If a service's spec grows unwieldy, the response is to split the service or factor shapes into more `components` within the same file (possibly splitting the service), not to introduce a second authoring tool.

### API audience & visibility

The one spec per service is the source of truth, but not every service or operation is meant for every consumer group (the three from *Context*). Two orthogonal labels, both declared in the spec, classify the surface so the developer portals ([ADR-0009](0009-api-gateway.md)) render **filtered projections** of the same specs rather than separate hand-maintained documents.

- **Service audience** — `info.x-audience`, exactly one per spec, an extensible enum seeded with `internal` and `public` (following Zalando's `x-audience`). `public` is an edge service whose contract third parties may see; `internal` is a service whose spec is documented for our own developers only — an east-west resource API consumed by other internal services and never edge-exposed. (A control-plane service like `authz` carries no spec at all — see *Decision* — so the label applies only to spec-bearing services.) It **defaults to `internal`** — fail-closed: a spec is never treated as public unless it says so.
- **Operation visibility** — `x-internal: true` on an individual operation (following Google's API visibility and Redocly's `x-internal`), default false. It drops an operation — an admin action, or a small internal-detail endpoint — from the *public* projection while keeping it in the internal one, so public docs stay curated to the endpoints that matter and internal docs stay complete.

**These labels are documentation scoping, not access control.** Removing an operation from a rendered spec does not protect it: exposure is decided solely by the edge route and Oathkeeper ([ADR-0009](0009-api-gateway.md)) — a service with no IngressRoute (`ingress.enabled: false`) is unreachable from the internet whatever its spec says. The two must not drift, so a CI check fails a spec marked `x-audience: public` whose service has no edge route (and an edge-exposed service whose spec says `internal`), keeping the documented audience and the real exposure boundary in lockstep.

## Consequences

### Positive

- One artifact powers server, internal client, frontend client, docs, and public SDKs. Per-service contract cost is roughly fixed regardless of how many consumers exist.
- Browser, third-party, and service-to-service consumers all see the same API shape; no protocol-translation layer.
- Schema-level validation is generated, not written — one validator per service, no hand-maintained duplication.
- Public API readiness is a CI artifact, not a project.

### Negative / Risks

- OpenAPI is awkward for complex discriminated unions and conditional schemas. Mitigated by vacuum ruleset rules enforcing flat schemas; complex polymorphism is a hint that the API surface is too coupled.
- Streaming story is pragmatic, not unified. Mitigated by per-WS-endpoint justification and acceptance that gRPC/Connect are not adopted for this alone.
- Cross-service shapes (error envelope, workflow handle) are duplicated across specs because each spec is kept self-contained (no external `$ref`s). Mitigated by their small, stable surface; a future bundler step could restore a single source if drift becomes a problem.

### Follow-ups

- The `mise run gen:*` task family (wrapping the `scripts/gen-*.sh` generators).
- `tools/codegen/openapi-ruleset.yaml` ruleset.
- Shared shapes (error envelope, workflow handle) declared inline in each `services/<service>/openapi.yaml` `components` block.
- A CI lint (`mise run lint:api-resources`) enforcing the flat-namespace invariant: no two `x-audience`-exposed specs
  claim the same top-level resource prefix, and each exposed prefix has a matching `ingress.resources` entry
  ([ADR-0017](0017-url-and-domain-structure.md)).
- A `mise run gen:openapi-public` projection task emitting the public docs bundle — `x-audience: public` specs with
  `x-internal` operations stripped — that the Scalar-rendered docs portals consume ([ADR-0009](0009-api-gateway.md),
  [ADR-0014](0014-frontend.md)). The internal portal renders the unfiltered specs directly.
- **Implemented:** `mise run lint:api-audience` (`tools/lint-api-audience`) enforces the audience↔exposure invariant —
  a spec's `info.x-audience` must agree with whether the service is edge-exposed (`public` ⇔ has an `/api` route via
  `ingress.resources`, read from the canonical dev values); a spec-less control-plane service (authz) is exempt.
- Lefthook pre-commit hook running the affected generator slice.
- CI drift-check job per [ADR-0002](0002-monorepo.md).

## Rules

- The contract source of truth is OpenAPI 3.1, one file per **resource-API** service at `services/<service>/openapi.yaml`. A control-plane/decision service whose contract is defined elsewhere (e.g. `authz` → SpiceDB schema, [ADR-0010](0010-auth.md)) ships no spec.
- Each spec's `servers` url is the shared flat `/api`, and paths are globally-unique resource nouns — the exposed URL is
  `<host>/api/<resource>` with no service segment ([ADR-0017](0017-url-and-domain-structure.md)). Vacuum lint fails if two
  `x-audience`-exposed specs claim the same top-level resource prefix. The API carries no version segment
  ([ADR-0022](0022-api-lifecycle.md)).
- Each spec is self-contained: cross-service shapes (error envelope, workflow handle) are declared inline in the spec's `components` and kept identical across services. Cross-file `$ref` is avoided to keep specs portable across the codegen and linting tools.
- Every spec declares `info.x-audience` (`internal` | `public`, extensible, default `internal`); operations withheld from public docs are marked `x-internal: true`. These are documentation-scoping labels, not access control.
- Exposure is enforced independently by the edge route + Oathkeeper ([ADR-0009](0009-api-gateway.md)); a CI check keeps `x-audience: public` and the service's `ingress.enabled` in agreement.
- All clients and server stubs are generated from the spec and committed. CI fails on drift.
- Hand-written code imports generated types. Parallel hand-written request/response types are forbidden.
- The service validates request schemas from the OpenAPI artifact via the generated `ogen` server. There is no separate edge validation.
- Business-rule validation lives only in the service, never at the edge.
- Server-Sent Events is the default streaming mechanism. WebSockets require a per-endpoint justification in the service README.
- gRPC, Connect-RPC, GraphQL, and tRPC are not used.
- OpenAPI YAML is hand-written. TypeSpec and equivalent authoring layers are not used.
- A spec change is a PR; merging is blocked on vacuum lint passing and on `mise run gen` producing no diff.

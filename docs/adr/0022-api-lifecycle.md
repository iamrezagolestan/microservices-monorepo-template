# ADR-0022: API Lifecycle & Versioning

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Platform team
- **Related:** [ADR-0008](0008-api-contracts.md), [ADR-0009](0009-api-gateway.md), [ADR-0013](0013-release-and-versioning.md)

## Context

[ADR-0008](0008-api-contracts.md) pins the API contract (OpenAPI 3.1) and breaking-change *detection*, and
[ADR-0013](0013-release-and-versioning.md) pins release tagging. Neither says how a live API evolves: how a
consumer that cannot upgrade in lockstep is carried across a breaking change. With the browser app as the
main consumer today but a public API a flag away ([ADR-0009](0009-api-gateway.md)), the lifecycle must be
decided before a second consumer exists.

## Decision drivers

1. **Consumers upgrade on their own schedule** — a breaking change must not force a flag-day.
2. **Breaking vs non-breaking is mechanical**, tied to the contract diff already in CI
   ([ADR-0008](0008-api-contracts.md)).
3. **Deprecation is announced in-band**, machine-readable, not a wiki note.
4. **Bounded surface** — a small team maintains at most two live majors.

## Decision

- **Major version in the path.** Service APIs are served under `/api/<svc>/v<major>/…`. A breaking change
  is a new major path; the old major keeps serving during the deprecation window.
- **SemVer on the contract.** Non-breaking additions bump minor/patch within the same major (no path
  change); breaking changes bump the major. "Breaking" is defined by the CI contract diff (oasdiff) from
  [ADR-0008](0008-api-contracts.md) — a detected breaking change without a major bump fails CI.
- **In-band deprecation signalling.** A deprecated version returns the `Deprecation` header (RFC 9745) and
  a `Sunset` header (RFC 8594) with the removal date, plus a `Link` to the migration notes.
- **Support window: N-1.** At most two majors are live at once (current + previous). The previous major is
  supported for a documented minimum window after the successor ships, then removed.
- **Internal (browser-app) consumers** ride the same mechanism, but because the app and API ship together
  ([ADR-0014](0014-frontend.md)) their window can be short; the machinery exists for the public-API case.

## Consequences

### Positive

- A consumer crosses a breaking change on its own schedule, guided by machine-readable headers.
- "Did this break the contract?" is answered by CI, not judgement.
- At most two majors live bounds the maintenance surface.

### Negative / Risks

- Running two majors means two code paths for the overlap window. Accepted and bounded by N-1 + the sunset
  date; the window is short when the only consumer is the co-shipped frontend.
- Path-based versioning pushes the version into every route. Accepted as the most legible, cache- and
  gateway-friendly option versus header/media-type versioning.

### Follow-ups

- `/v<major>` path convention in `services/_template/openapi.yaml` and the gateway routes
  ([ADR-0009](0009-api-gateway.md)).
- `Deprecation`/`Sunset`/`Link` header emission in the shared HTTP middleware.
- A major-lifecycle registry (which majors are live, their sunset dates), alongside
  [docs/release.md](../release.md).

## Rules

- Service APIs are versioned by major in the path (`/api/<svc>/v<major>`). A breaking change is a new
  major; the old major serves through its deprecation window. `(review-only)`
- A breaking contract change without a major bump fails CI (oasdiff, [ADR-0008](0008-api-contracts.md)).
  `(CI: ci-contract)`
- A deprecated version returns `Deprecation` + `Sunset` + `Link` headers with the removal date. `(review-only)`
- At most two majors are live (N-1); the previous major is removed only after its documented sunset window.
  `(review-only)`

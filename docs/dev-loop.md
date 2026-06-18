# Local development loop

Per [ADR-0003](adr/0003-cluster-topology.md), k3d is the only local runtime.
`mise run cluster:up` creates the cluster and applies the lightweight dev
dependencies (Postgres, Temporal, SpiceDB) from `infra/local/deps.yaml`. The
inner loop itself is `skaffold dev` (`mise run dev`), which builds, deploys, and
live-reloads the services in-cluster.

This file is editor-agnostic. Any IDE that can load a `.env` file and run a Go
`main.go` works the same way.

## One-time setup

```sh
mise run setup                       # lefthook hooks
cp services/catalog/.env.example services/catalog/.env  # only for host-process debugging
```

## Inner loop (in-cluster)

```sh
mise run cluster:up          # k3d + deps (Postgres, Temporal, SpiceDB)
mise run dev                 # skaffold dev: build + deploy + live-reload all services
mise run dev -m catalog      # …or scope to a single service (others keep their last deploy)
```

`skaffold dev` port-forwards the service servers (e.g. orders → `localhost:8080`)
plus Postgres (`localhost:5432`) and the Temporal UI (`localhost:8233`) so local
tools like `psql` can reach them.

## Host-process debugging (optional)

To run one service on the host instead of in-cluster — for a debugger, dlv, or
faster iteration — use the deps' port-forwards. `mise run dev -m platform` brings
up Postgres on `localhost:5432` without deploying any service, then:

```sh
mise run -C services/catalog migrate   # dbmate up against localhost:5432
mise run -C services/catalog run       # go run ./cmd/server  → http://localhost:8080
```

To debug, point your editor's Go run configuration at
`services/catalog/cmd/server/main.go` with the working directory set to the
service folder so `.env` is picked up. Breakpoints, evaluate-expression, and
hot-restart all work — the service is a plain host process.

## Teardown

```sh
mise run cluster:down                    # stops port-forwards + deletes the k3d cluster
```

## Formatting & linting

`mise run format` / `mise run lint` cover every language, including Markdown.
Generated code is never linted or formatted: Go SDKs (ogen) and sqlc store code
are skipped via `exclusions.generated` in `.golangci.yml` (both `golangci-lint
run` and `golangci-lint fmt`), the TS SDKs and admin `_generated/` via
`biome.json`, and rumdl via `.rumdl.toml`.
Markdown is governed by **rumdl** (`.rumdl.toml`), the single source of truth for
both linting and formatting. `mise run format:md` (`rumdl fmt`) auto-fixes most
rules and runs on staged `.md` files via the lefthook pre-commit hook. For inline
editor warnings that match CI exactly, point your editor at rumdl's LSP
(`rumdl server`) — the repo stays IDE-neutral and ships no editor config.

**Tables** are the one thing `--fix` can't repair. `MD060` enforces *aligned*
tables (whitespace-padded columns) — the exact format the JetBrains
"Incorrect table formatting" inspection wants, so CI and the IDE agree. When a
table is flagged, align it with **Alt+Enter → "Reformat table"** in JetBrains
(note: plain `Ctrl+Alt+L` does *not* align Markdown tables — only that quick-fix
does). Outside JetBrains, align the columns by hand to satisfy CI.

## The full platform is not local

The gateway (Tyk), auth stack (Kratos), and GitOps (ArgoCD) are **not** brought up
locally — `cluster:up` only applies the lightweight deps above. The full platform
is delivered by ArgoCD in staging/prod (per [ADR-0003](adr/0003-cluster-topology.md)).
If a bug only reproduces with the gateway, auth, or GitOps in the path, reproduce
it in a staging environment rather than locally.

# Local development loop

Per [ADR-0003](adr/0003-cluster-topology.md), k3d is the only local runtime.
`mise run cluster:lite` creates the cluster and applies the lightweight dev
dependencies (Postgres, Temporal, SpiceDB) from `infra/local/deps.yaml`. The
inner loop is **native execution**: you run the service you are changing directly
on the host against those dependencies — no image build, no in-cluster redeploy,
no file-watch on the hot path.

This file is editor-agnostic. Any IDE that can load a `.env` file and run a Go
`main.go` works the same way.

## One-time setup

```sh
mise run setup                       # lefthook hooks
cp services/catalog/.env.example services/catalog/.env  # only for host-process debugging
```

## Inner loop (native)

```sh
mise run cluster:lite  # k3d + a CNI + deps (Postgres, Temporal, SpiceDB)
mise run dev:forward   # port-forward the deps to localhost (leave running in its own terminal)
mise run db:migrate    # apply each service's migrations to the local Postgres
# then run the service natively (any editor/IDE, or go run):
DATABASE_URL=postgres://dev:dev@localhost:5432/catalog?sslmode=disable \
  TEMPORAL_HOST_PORT=localhost:7233 SPICEDB_ENDPOINT=localhost:50051 \
  go run ./services/catalog/cmd/server      # → http://localhost:8080
```

`dev:forward` exposes Postgres (`localhost:5432`), Temporal (`7233` gRPC / `8233`
UI), and SpiceDB (`50051`) so the host process — and tools like `psql` — can reach
them. Re-running the service is just re-running the binary; there is nothing to
rebuild or redeploy. To debug, point your editor's Go run configuration at
`services/<svc>/cmd/server/main.go` with those env vars set; breakpoints and
hot-restart work because the service is a plain host process.

### Putting a service *in* the cluster (edge/auth/e2e)

When you need the service behind the edge (not the native hot path), do a one-shot
build-import-deploy — no watch loop:

```sh
mise run service:deploy -- catalog       # build → k3d image import → helm upgrade
mise run service:undeploy -- catalog     # helm uninstall
```

## Teardown

```sh
mise run cluster:stop        # stops the cluster, keeps the image cache + volumes
mise run cluster:delete       # deletes the cluster (reclaims disk, forces a clean recreate)
```

## After a reboot

If the whole cluster is stuck (every pod `ContainerCreating`, Cilium down) after
your machine rebooted, it's almost always the node's `host.k3d.internal` alias:
Docker's restart policy replays the node container raw, skipping the k3d start
step that injects it, so image pulls fail and the CNI never comes up. Heal it:

```sh
mise run cluster:heal        # stop + start so k3d re-injects host.k3d.internal
```

This is idempotent; run it whenever the cluster looks wedged after a reboot.

## End-to-end & visual tests

End-to-end and visual-regression tests are owned by [ADR-0018](adr/0018-testing-strategy.md):
**Playwright** drives them from the repo-root `e2e/` workspace against the full platform.

```sh
mise run cluster:full         # the environment e2e runs against (ArgoCD-driven)
mise run e2e:smoke            # product golden path + a key dashboard render
mise run e2e                  # full suite: every journey, every dashboard, all visual baselines
```

The browser test is the acceptance gauge — a rendered, authenticated dashboard (Grafana,
Hubble, Temporal) is the proof the whole stack underneath is wired. A Go/shell **preflight
readiness** check runs first so a red e2e reads "infra down" vs "app broken". The suite ships a
committed deterministic test identity (an AAL1 user + an AAL2 operator); there is nothing to seed
by hand. Playwright's runner is Node — the **one** sanctioned Node tool in the repo
([ADR-0001](adr/0001-language-and-runtime.md)), scoped to `e2e/` and CI; everything else stays on Bun.

## Formatting & linting

`mise run format` / `mise run lint` cover every language, including Markdown.
Generated code is never linted or formatted: Go SDKs (ogen) and sqlc store code
are skipped via `exclusions.generated` in `.golangci.yml` (both `golangci-lint
run` and `golangci-lint fmt`), the TS SDKs and admin `_generated/` via
`biome.jsonc`, and rumdl via `.rumdl.toml`.
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

## The full platform: `mise run cluster:full`

The edge (Traefik + Ory Oathkeeper), auth stack (Kratos), and the data tier are
**not** brought up by `cluster:lite` — it only applies the lightweight deps above.
For end-to-end work, the edge, auth, NetworkPolicy, or observability on a laptop,
`mise run cluster:full` (scripts/cluster-full.sh) stands up the **same charts
production runs**, at a single replica ([ADR-0016](adr/0016-environment-parity.md)),
**delivered by ArgoCD** — the same engine staging/prod use: **Cilium** as the CNI
(real NetworkPolicy + Hubble), **CNPG**, the **Temporal** chart, the **SpiceDB**
chart, in-cluster **MinIO**, the **observability** chart, Traefik + Ory (Kratos +
Oathkeeper), and the Lowdefy console.

`cluster:full` creates the cluster, installs the two components ArgoCD cannot
bootstrap (the CNI and ArgoCD itself), plants the SOPS age key, **builds + pushes the
repo images (the 5 services and the Lowdefy console) to a local registry**, then
applies a local root-app (`infra/gitops/bootstrap-local/`) that syncs committed
**`master`** from the remote. Ordering, readiness, and secret materialisation are
ArgoCD's job (sync waves), not a shell script's. Because it syncs committed `master`,
uncommitted infra needs a push — see [cluster/gitops-local.md](cluster/gitops-local.md);
for fast iteration on uncommitted **service** code use `service:deploy`.

**Local image registry (the CI stand-in).** Prod's GitOps works because CI builds
each repo image, pushes it to ghcr, and Argo pulls it. Locally there is no CI, so
`cluster:full` builds and pushes those images to a k3d-managed registry
(`k3d-registry.localhost:5000`) at a stable `:local` tag, and the local overlays point
`image.repository` there — Argo then deploys services and Lowdefy **exactly as prod
does**, the only difference being the registry host (the sanctioned env-divergence
point). The registry is wired at cluster-create via `--registry-use`, so a pre-existing
cluster must be recreated once to gain it. **One-time host setup:** add
`127.0.0.1 k3d-registry.localhost` to `/etc/hosts` so the host `docker push` resolves
the registry to IPv4 (bare `*.localhost` resolves to IPv6 `::1` on some systems, which
the registry does not listen on). This mirrors the proxy: machine setup, never in the
repo. The only components still installed imperatively are the two ArgoCD cannot
bootstrap (Cilium and ArgoCD) — the same pair prod bootstraps before GitOps takes over.

Local diverges from prod **only** through one values overlay,
`infra/gitops/platform/local/values.yaml`, consumed the same way the ArgoCD
ApplicationSet consumes the dev/staging/prod overlays. The only genuine local
substitutions are: in-cluster MinIO instead of the off-cluster bucket (S3 API both
sides), cert-manager with a **self-signed** `*.dev.localtest.me` wildcard issuer
(same mechanism as prod's Let's Encrypt), and a **committed throwaway age key** so
SOPS decrypts locally exactly as it does in prod (the `sops-operator` materialises
every credential from `infra/gitops/platform/local/secrets/platform.enc.yaml` —
only the age key itself is created imperatively). Plan for ~16GB free RAM. Tear
down with `mise run cluster:stop` (keep the cache) or `cluster:delete` (delete).

### Endpoints

Everything is served from one origin, **`https://dev.localtest.me:8443`** (real DNS
→ 127.0.0.1, self-signed wildcard TLS — accept the cert once). The edge (Traefik)
matches longest-prefix, so the specific routes below win over the `/` catch-all.

| URL                                                            | What it gives you                     | Auth           | Defined in                                       |
|----------------------------------------------------------------|---------------------------------------|----------------|--------------------------------------------------|
| `/`                                                            | Landing page (host-run `next dev`)    | public         | `infra/local/edge-auth.yaml`                     |
| `/panel`, `/devportal`                                         | Frontend authenticated areas          | Kratos session | `apps/frontend/src/proxy.ts`                     |
| `/auth/login`, `/auth/registration`, …                         | Kratos UI pages (host-run `next dev`) | public         | `infra/local/edge-auth.yaml`                     |
| `/auth/self-service`, `/auth/.well-known`, `/auth/sessions`    | Kratos public API                     | public         | `infra/local/edge-auth.yaml`                     |
| `/api/catalog/`, `/api/orders/`, `/api/orgs/`, `/api/payment/` | Service APIs through the edge         | Oathkeeper     | `infra/helm/service/templates/ingressroute.yaml` |
| `/api/observability/faro`                                      | Faro/RUM browser-telemetry ingest     | public         | `infra/gateway/frontend-observability.yaml`      |

The **ops tier** (ADR-0017) is a separate origin per operator dashboard under
`*.ops.<host>` — never a product path. The **coarse gate** is a claim, not a
SpiceDB call: the ops forward-auth requires the `operator` trait **and** an AAL2
session, and makes no `Checker` call, so the debugging surface never shares fate
with the product authz plane ([docs/ops/break-glass.md](ops/break-glass.md)). A
bare login does not grant tool access. Per-tool `dashboard:<tool>#view` grants are
the **optional fine layer** (`OPS_FINE_GRAINED`), off by default.

The local edge is published on the unprivileged port **`:8443`** (see the URLs
below); deployed envs terminate on standard `443` and omit the port.

The **Auth** column shows the always-on coarse gate (`operator` claim + AAL2); the
optional per-tool `dashboard:<tool>#view` fine layer is off by default.

| Ops URL                                       | Tool                                         | Auth                                          | Defined in                         |
|-----------------------------------------------|----------------------------------------------|-----------------------------------------------|------------------------------------|
| `https://o11y.ops.dev.localtest.me:8443/`  | **Grafana** — metrics/logs/traces            | operator + AAL2                               | `infra/gateway/ingressroutes.yaml` |
| `https://network.ops.dev.localtest.me:8443/`   | Cilium **Hubble UI** — network-flow map      | operator + AAL2                               | `infra/gateway/ingressroutes.yaml` |
| `https://workflows.ops.dev.localtest.me:8443/` | **Temporal Web UI**                          | operator + AAL2                               | `infra/gateway/ingressroutes.yaml` |
| `https://s3.ops.dev.localtest.me:8443/`    | **MinIO console** (non-prod)                 | operator + AAL2, then `minio` / `minio-password` | `infra/gateway/ingressroutes.yaml` |
| `https://admin.ops.dev.localtest.me:8443/`    | **Lowdefy** admin console                    | operator + AAL2                               | `infra/gateway/ingressroutes.yaml` |
| `https://deploy.ops.dev.localtest.me:8443/`     | **Argo CD**                                  | operator + AAL2                               | `infra/gateway/ingressroutes.yaml` |
| `https://k8s.ops.dev.localtest.me:8443/`      | **Headlamp** — k8s debug UI (opt-in, r/o)    | operator + AAL2                               | opt-in ([ADR-0024](adr/0024-kubernetes-debug-ui.md)) |
| `https://db.ops.dev.localtest.me:8443/`       | **pgweb** — read-only DB inspector (opt-in)  | operator + AAL2                               | opt-in ([ADR-0012](adr/0012-internal-admin.md))      |

Grafana trusts the Oathkeeper edge and serves anonymously (its login form is
disabled, `auth.anonymous` Admin) — an operator who clears the edge lands straight
on the dashboards, no second login. Without the edge you can still reach it by
port-forward: `kubectl -n platform port-forward svc/grafana 3000:80`, then
<http://localhost:3000/> (anonymous Admin; it serves at root, not a sub-path).

The **MinIO console** is the one dashboard that keeps a second login: unlike
Grafana/Argo CD (which trust the Oathkeeper edge and serve anonymously), MinIO's
console has no proxy-trust/SSO mode, so after the edge gate it prompts for MinIO
credentials — the pre-seeded root user `minio` / `minio-password`.

`cluster:full` brings up the whole platform (edge, services, observability,
console); Argo CD itself is installed imperatively for the local full tier and is
reachable at `deploy.ops.<host>` like the other dashboards. The two **opt-in** ops
tools — Headlamp (`k8s.ops`) and pgweb (`db.ops`) — are off by default
([docs/operational-surface.md](operational-surface.md)); enable them in the local
values overlay when you want them, and they appear at their origins above.

### Login flow

The edge serves `*.dev.localtest.me` on `:8443` (real DNS → 127.0.0.1, no
`/etc/hosts` edits). Auth-gated routes (e.g. the Hubble UI at
`https://hubble.dev.localtest.me:8443/`) redirect an unauthenticated browser to
Kratos at `…/auth/login`; register/login there and the redirect returns you to the
gated page. The Kratos session cookie is scoped to `dev.localtest.me` (parent
domain), so one login covers the edge and every `*.dev.localtest.me` subdomain. The landing page and `/auth` UI are
served by a host-run `next dev`
(run `next dev -H 0.0.0.0` on the host — the dev server is not in-cluster), wired
through `infra/local/edge-auth.yaml`.

**There is no seeded user** — Kratos starts with an empty identity store. Create
one at <https://dev.localtest.me:8443/auth/register> with any email and a password
that clears Kratos' defaults (≥ 8 chars and not a known-breached password — it runs
a HaveIBeenPwned check, so `password123` is rejected); then log in with it. Email
verification is configured but the local SMTP sink isn't wired up, so verification
mail isn't delivered — login doesn't require it.

Start the host `next dev` with **`APP_ORIGIN=dev.localtest.me`** so the login and
registration **server actions** pass Next's Origin/CSRF check (it feeds
`serverActions.allowedOrigins` in `next.config.mjs`). Without it, form submits from
the edge origin are rejected as cross-origin:

```sh
APP_ORIGIN=dev.localtest.me next dev -H 0.0.0.0
```

The full Kratos self-service set is served under `/auth/` — `login`, `register`,
`recovery`, and `settings` (these are frontend pages, identical in every env, not
local-only).

> On a restricted network whose registry blocks **digest** pulls (only tags
> resolve), pre-pull the platform images by tag and `k3d image import` them; the
> upstream charts pin images by digest. A normal connection pulls them directly.

## HTTP proxies

Proxy configuration is a property of **your machine**, not of this template — the
repo carries no proxy values or logic, and the scripts never will. Behind a
corporate/loopback proxy you configure it once, system-side, and the `cluster:*`
tasks work unchanged.

There are two independent layers, and they need separate handling:

**1. Host-side pulls (the k3s node image, host `docker pull`/`helm`).** These go
through the Docker daemon and the Docker CLI on your host. Point both at your proxy:

- Docker **CLI** (`~/.docker/config.json`) — used by host `docker` commands:

  ```json
  {
    "proxies": {
      "default": {
        "httpProxy": "http://proxy.example.com:8080",
        "httpsProxy": "http://proxy.example.com:8080",
        "noProxy": "10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.svc.cluster.local,127.0.0.1,localhost,.localtest.me"
      }
    }
  }
  ```

- Docker **daemon** (`/etc/systemd/system/docker.service.d/http-proxy.conf`) — so
  the daemon's own image pulls are proxied:

  ```ini
  [Service]
  Environment="HTTP_PROXY=http://proxy.example.com:8080"
  Environment="HTTPS_PROXY=http://proxy.example.com:8080"
  Environment="NO_PROXY=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.svc.cluster.local,127.0.0.1,localhost,.localtest.me"
  ```

  then `sudo systemctl daemon-reload && sudo systemctl restart docker`.

**2. In-cluster pulls (Cilium, the inner-loop deps, every ArgoCD-synced workload).**
These are pulled by the **containerd that runs inside the k3d node**, using the
node's own process environment — which none of the settings above reach. k3d creates
its nodes through the Docker SDK, so the node does **not** inherit
`~/.docker/config.json` proxies, the daemon's proxy env, or your exported shell
`HTTP_PROXY`. The proxy has to be present on the node, and the only way to put it
there is at cluster-create time (k3d `-e` flags).

`cluster-ensure.sh` bridges this **from your shell**: at create time it reads your
exported `HTTP_PROXY`/`HTTPS_PROXY` and, if set, injects it onto the node — rewriting
a loopback proxy (`127.0.0.1`/`localhost`) to `host.k3d.internal` so the node can
reach it. No proxy value lives in the repo: a clean shell makes a pristine cluster;
a proxied shell is wired automatically. So the whole setup is just:

```sh
# Export your proxy once, system-side (skip on a clean network — nothing to do).
export HTTPS_PROXY=http://proxy.example.com:8080   # or http://127.0.0.1:8118, etc.

mise run cluster:full      # cluster:ensure creates the cluster with your proxy wired

# Verify the node actually got it (only meaningful on a proxied machine):
docker exec k3d-platform-server-0 env | grep -i proxy
```

`cluster:ensure` is convergent — it reuses an existing cluster (only starting it), so
export the proxy **before the first** bring-up. To rewire an already-created cluster,
recreate it (`mise run cluster:delete && mise run cluster:full`). If a node restart
drops `host.k3d.internal`, re-add `<gateway-ip> host.k3d.internal` to the node's
`/etc/hosts` (Docker normally provides it as the gateway).

> **Stalled image pulls through a proxy.** Even with the node proxied, some egress
> proxies time out or truncate large image layers on containerd's single-stream pull
> (Cilium, ArgoCD, and the SpiceDB seed's `authzed/zed` are the usual victims),
> leaving pods in `ImagePullBackOff`. The opt-in **`mise run cluster:unwedge`**
> ([`scripts/cluster-unwedge-images.sh`](../scripts/cluster-unwedge-images.sh))
> recovers them: it host-pulls whatever is stuck (Docker resumes/retries reliably),
> `k3d image import`s it into the node, and restarts the waiting pods. Re-run it — or
> `watch -n15 mise run cluster:unwedge` — while a fresh `cluster:full` converges.
> Clean networks never need it.

# Running the full tier through ArgoCD locally (ADR-0004, ADR-0016)

The default `mise run cluster:full` installs the platform charts **helm-direct** —
it is fast and needs no git remote, which is what you want for inner-loop and
pre-merge work. It deliberately does **not** exercise ArgoCD, so it cannot catch
problems in sync-wave ordering, app-of-apps discovery, or the `ApplicationSet`
generators that only ArgoCD evaluates.

This page documents the **opt-in** path that closes that last gap: bring the same
platform up the way prod does — the app-of-apps reconciled by ArgoCD — but against
a **local git source** instead of `github.com/.../master`. CI's end-to-end job and
per-PR previews reuse this exact path.

It is opt-in precisely because it is slower (a full reconcile + image pulls) and
needs a git source ArgoCD can reach in-cluster. Reach for it when you are changing
anything under `infra/gitops/bootstrap/` (the generators, sync waves, or the
app-of-apps wiring) — those are invisible to the helm-direct path.

## Why a local git source at all

ArgoCD reconciles from a git URL, not your working tree. Pointed at
`github.com/.../master` (as `root-application.yaml` and both `ApplicationSet`s are),
it would deploy **committed master**, not your local changes. So the only honest
way to test your tree through ArgoCD is to make ArgoCD read your tree. Two options:

### Option A — `argocd app sync --local` (no server, quickest)

Generate the manifests from your working tree and sync them into a
helm-direct-installed ArgoCD, bypassing the repo-server's git fetch:

```sh
# 1. Bring the cluster + Cilium + ArgoCD up (ArgoCD is a platform chart).
mise run cluster:full:up min            # cluster + baseline; or full
helm --kube-context k3d-platform-full upgrade --install argocd \
  infra/helm/platform/argocd -n argocd --create-namespace

# 2. Apply the app-of-apps, then sync each generated Application from local files.
kubectl --context k3d-platform-full apply -f infra/gitops/bootstrap/root-application.yaml
argocd app sync root --local infra/gitops/bootstrap
```

`--local` makes ArgoCD render the named app from the local directory once, so the
sync-wave annotations and app discovery run through ArgoCD's own engine. It is a
one-shot (no continuous reconcile), which is enough to validate ordering.

### Option B — in-cluster git server (continuous, closest to prod)

Push your working tree to a throwaway in-cluster git server and repoint the
app-of-apps + `ApplicationSet`s at it, so ArgoCD reconciles continuously exactly
as in prod:

```sh
# 1. A tiny git server in-cluster (gitea is one single-binary option).
helm --kube-context k3d-platform-full upgrade --install gitea \
  oci://docker.gitea.com/charts/gitea -n gitea --create-namespace \
  --set gitea.admin.username=dev --set gitea.admin.password=dev

# 2. Push the working tree to it (port-forward, then git push).
kubectl --context k3d-platform-full -n gitea port-forward svc/gitea-http 3001:3000 &
git push http://dev:dev@localhost:3001/dev/template.git HEAD:refs/heads/master

# 3. Point ArgoCD at the in-cluster URL instead of GitHub. The bootstrap manifests
#    read ${GITOPS_REPO_URL:-github...} — override it for the local apply:
GITOPS_REPO_URL=http://gitea-http.gitea.svc:3000/dev/template.git \
  envsubst < infra/gitops/bootstrap/root-application.yaml \
  | kubectl --context k3d-platform-full apply -f -
```

> The bootstrap manifests pin the GitHub URL today; making `repoURL` an
> `envsubst`/Helm parameter is the one change needed to use Option B unmodified.
> Until then, repoint the three `repoURL` fields by hand (root-application +
> appset-platform + appset-services).

## What this validates that helm-direct does not

- **Sync-wave ordering** — CRDs → operators → instances (`sync-wave` annotations).
- **App-of-apps discovery** — the `directory.recurse` walk of `bootstrap/`.
- **`ApplicationSet` generators** — the `matrix` of env × `infra/helm/platform/*`,
  and the per-env `valueFiles` path convention this template relies on.

The helm-direct `cluster:full` covers everything **below** ArgoCD (the charts, the
values overlays, the data tier, the edge). Use this page only when the thing you
changed lives in `infra/gitops/bootstrap/`.

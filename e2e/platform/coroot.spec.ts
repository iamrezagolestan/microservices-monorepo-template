// Coroot operator dashboard (ADR-0017, ADR-0025) — the eBPF service map + APM that
// replaces the retired Hubble UI. Gated at coroot.ops.<host> (dashboard:coroot#view) and
// the app renders behind a real AAL2 session. Like Hubble, Coroot's SPA only runs
// at an origin ROOT, which the {tool}.ops.<host> topology gives it.
import { type APIRequestContext, expect, request, test } from "@playwright/test";
import {
  expectAal1Forbidden,
  expectOperatorAllowed,
  expectUnauthenticatedDenied,
} from "../fixtures/dashboard";
import { OPERATOR_STATE, opsURL } from "../fixtures/env";

const COROOT = `${opsURL("coroot")}/`;

// Coroot's project id is GENERATED at first start (e.g. "pw6xp370"), so it can
// never be hard-coded — discover it from /api/user, which also confirms the edge
// handed us an authenticated session rather than the SPA shell.
async function corootProjectId(ctx: APIRequestContext): Promise<string> {
  const res = await ctx.get(`${opsURL("coroot")}/api/user`);
  expect(res.ok(), "Coroot /api/user answers behind the operator session").toBeTruthy();
  expect(
    res.headers()["content-type"] ?? "",
    "/api/user returns JSON, not the SPA shell (Coroot serves index.html for unknown paths)",
  ).toContain("application/json");
  const { projects } = await res.json();
  expect(projects?.length ?? 0, "Coroot has at least one project").toBeGreaterThan(0);
  return projects[0].id;
}

test.describe("coroot ops dashboard (Coroot)", () => {
  test("gated: unauthenticated is denied", async () => {
    await expectUnauthenticatedDenied("coroot");
  });

  test("gated: AAL1 product session is forbidden", async () => {
    await expectAal1Forbidden("coroot");
  });

  test("gated: AAL2 operator passes the dashboard:coroot#view grant", async () => {
    await expectOperatorAllowed("coroot");
  });

  // The "operator but missing this tool's grant" fine gate is unit-tested in
  // services/authz/internal/decision — once every routed dashboard is granted to
  // group:operator, no routed-but-ungranted tool remains to assert it at the edge.

  test.describe("renders behind AAL2", () => {
    test.use({ storageState: OPERATOR_STATE });
    test("the Coroot app paints at the subdomain root", async ({ page }) => {
      await page.goto(COROOT);
      await expect(page).not.toHaveURL(/\/auth\/login/);
      // coroot sets the document title to "Coroot" and mounts its SPA at root.
      // (Coroot deploys last and ClickHouse is slow, so allow a generous timeout.)
      await expect(page).toHaveTitle(/Coroot/, { timeout: 60_000 });
    });
  });

  // The title check above proves the route and the auth gate — and NOTHING else. It
  // passes with ClickHouse down, zero node-agents reporting, or an entirely empty
  // service map, because Coroot serves its SPA shell for any path. These tests are
  // the functional gauge (ADR-0018): they assert the agents are actually reporting
  // and that the map contains what ADR-0025 adopted Coroot to show.
  //
  // Deliberately NOT @smoke: Coroot syncs at wave 30 behind a slow ClickHouse, and
  // the eBPF agents need a few minutes of traffic before applications appear.
  test.describe("the service map has real data", () => {
    let ctx: APIRequestContext;
    let apps: string[];

    test.beforeAll(async () => {
      ctx = await request.newContext({ ignoreHTTPSErrors: true, storageState: OPERATOR_STATE });
      const projectId = await corootProjectId(ctx);
      const res = await ctx.get(`${opsURL("coroot")}/api/project/${projectId}/overview/applications`);
      expect(res.ok(), "Coroot applications overview answers").toBeTruthy();
      const body = await res.json();
      // Application ids are "<project>:<namespace>:<kind>:<name>"; drop the project
      // prefix so assertions read against the stable part.
      apps = (body.data?.applications ?? []).map((a: { id: string }) =>
        a.id.split(":").slice(1).join(":"),
      );
    });

    test.afterAll(async () => {
      await ctx?.dispose();
    });

    test("the node-agent is reporting — the map is not empty", () => {
      expect(apps.length, "Coroot discovered applications (agents reporting)").toBeGreaterThan(0);
    });

    test("the demo services appear as their own applications", () => {
      for (const svc of ["catalog", "orders", "payment"]) {
        expect(
          apps.some((id) => id.startsWith(`platform:Deployment:${svc}`)),
          `${svc} appears in the Coroot map`,
        ).toBeTruthy();
      }
    });

    // THE regression guard for ADR-0025. hubble-ui collapsed every workload sharing
    // `app.kubernetes.io/name` into one card, so all four Temporal roles rendered as
    // a single "temporal" node — that defect is why it was replaced. Coroot keys by
    // Deployment instead. If this ever fails, the migration has been undone.
    // SLOs are declared in the Coroot CR (infra/helm/platform/coroot), not clicked
    // into the UI — ADR-0004/ADR-0011 forbid config that lives only in a dashboard.
    // Asserting the overrides arrived proves the declarative path actually works;
    // if someone "simplifies" the CR back to UI setup, this fails.
    test("SLO objectives arrive from the CR, not the UI", async () => {
      const projectId = await corootProjectId(ctx);
      const res = await ctx.get(`${opsURL("coroot")}/api/project/${projectId}/inspections`);
      expect(res.ok(), "Coroot inspections API answers").toBeTruthy();
      const checks: { id: string; application_overrides?: { id: string }[] }[] =
        (await res.json()).data?.checks ?? [];

      for (const id of ["SLOAvailability", "SLOLatency"]) {
        const check = checks.find((c) => c.id === id);
        expect(check, `${id} inspection exists`).toBeDefined();
        const overridden = (check?.application_overrides ?? []).map((o) => o.id);
        for (const svc of ["catalog-server", "orders-server", "payment-server"]) {
          expect(
            overridden.some((o) => o.endsWith(`platform:Deployment:${svc}`)),
            `${svc} has a declared ${id} objective`,
          ).toBeTruthy();
        }
      }
    });

    test("Temporal's roles stay distinct, the defect that retired hubble-ui", () => {
      const roles = ["frontend", "history", "matching", "worker"];
      const found = roles.filter((r) =>
        apps.includes(`platform:Deployment:temporal-${r}`),
      );
      expect(found, "each Temporal role is its own application, not one collapsed node").toEqual(
        roles,
      );
    });
  });
});

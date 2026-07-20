// Coroot operator dashboard (ADR-0017, ADR-0025) — the eBPF service map + APM that
// replaces the retired Hubble UI. Gated at map.ops.<host> (dashboard:map#view) and
// the app renders behind a real AAL2 session. Like Hubble, Coroot's SPA only runs
// at an origin ROOT, which the {tool}.ops.<host> topology gives it.
import { expect, test } from "@playwright/test";
import {
  expectAal1Forbidden,
  expectOperatorAllowed,
  expectUnauthenticatedDenied,
} from "../fixtures/dashboard";
import { OPERATOR_STATE, opsURL } from "../fixtures/env";

const COROOT = `${opsURL("map")}/`;

test.describe("map ops dashboard (Coroot)", () => {
  test("gated: unauthenticated is denied", async () => {
    await expectUnauthenticatedDenied("map");
  });

  test("gated: AAL1 product session is forbidden", async () => {
    await expectAal1Forbidden("map");
  });

  test("gated: AAL2 operator passes the dashboard:map#view grant", async () => {
    await expectOperatorAllowed("map");
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
});

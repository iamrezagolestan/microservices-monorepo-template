// The registration → personal-org flow (ADR-0010, ADR-0006). Kratos owns identities;
// `orgs` owns tenancy, and the two are joined by exactly one wire: the blocking
// `after` web_hook on the self-service registration flow
// (infra/auth/kratos/values.yaml) → POST /identity-created → the RegisterUser
// Temporal workflow → personal org + admin membership + the SpiceDB `org#admin`
// tuple.
//
// This is the gauge for a seam with no unit-test equivalent — it spans Kratos, the
// edge, the orgs server, Temporal, the orgs worker and SpiceDB, and every one of
// them has to be up for an org to appear. It also pins the boundary that is easy to
// misread: identities created through the Kratos ADMIN API (fixtures/bootstrap.ts,
// scripts/ops-grant.sh) do NOT run self-service flows, so they get no org. Seeing
// seeded identities with an empty orgs list is correct; seeing a *registered* user
// with no org is the regression this catches.
import { expect, test } from "@playwright/test";
import { OPERATOR_STATE, opsURL } from "../fixtures/env";
import { register } from "../fixtures/kratos";
import { portForward } from "../fixtures/kube";

const KRATOS_ADMIN = "http://127.0.0.1:4434";

// Unique per run: Kratos enforces email uniqueness globally, and the personal org is
// NAMED by the email (activities.CreatePersonalOrgActivity → CreateOrg(email)), so
// the address doubles as the org's assertable identity.
const EMAIL = `signup-${Date.now()}@e2e.localtest.me`;

// Unlike the admin import path used by the bootstrap fixture, self-service
// registration DOES enforce the password policy (haveibeenpwned, min_password_length
// 12, identifier_similarity_check). Keep it long, unbreached, and dissimilar to the
// address — a policy rejection would fail as "no org appeared" and read as an orgs
// bug rather than a bad fixture.
const PASSWORD = "Tr0ubadour-Fjord-Lantern-9!";

test.describe("self-service registration", () => {
  // The assertion runs as the operator: the orgs changelist is an ops dashboard.
  test.use({ storageState: OPERATOR_STATE });

  // The identity outlives the org cleanup below, so remove it directly through the
  // admin API — same teardown shape as the createOperator suite in admin.spec.ts.
  test.afterAll(async () => {
    const pf = await portForward("ory-kratos-admin", 4434, 80);
    try {
      const res = await fetch(
        `${KRATOS_ADMIN}/admin/identities?credentials_identifier=${encodeURIComponent(EMAIL)}`,
      );
      if (!res.ok) return;
      const list = (await res.json()) as Array<{ id: string; traits?: { email?: string } }>;
      const hit = list.find((i) => i.traits?.email === EMAIL);
      if (hit) {
        await fetch(`${KRATOS_ADMIN}/admin/identities/${hit.id}`, { method: "DELETE" });
      }
    } finally {
      pf.stop();
    }
  });

  test("registering a new identity creates its personal org @smoke", async ({ browser, page }) => {
    // Sign up from a clean, anonymous context — the way a human would. `storageState:
    // undefined` is load-bearing, not decoration: browser.newContext() INHERITS the
    // describe-level test.use({ storageState }), so without the override this context
    // carries the operator's ory_kratos_session, and Kratos bounces an already
    // authenticated visitor off the registration flow to the landing page — the form
    // never renders and the failure reads as a missing field.
    const anon = await browser.newContext({ ignoreHTTPSErrors: true, storageState: undefined });
    try {
      await register(await anon.newPage(), EMAIL, PASSWORD);
    } finally {
      await anon.close();
    }

    // The org is eventually-consistent: the web_hook only ENQUEUES RegisterUser, and
    // cmd/worker runs the two dual-write activities out of band. Poll with a reload
    // rather than asserting once — a single assertion races the worker. A timeout
    // here means the workflow never completed (worker down, or a failed SpiceDB
    // leg), not that the webhook never fired: a failed enqueue is blocking and would
    // already have failed `register` above.
    await expect(async () => {
      await page.goto(`${opsURL("admin")}/orgs`);
      await expect(page.getByText(EMAIL)).toBeVisible({ timeout: 5_000 });
    }).toPass({ timeout: 60_000 });

    // Clean up the org. Not just tidiness: the changelist grid paginates at 20 rows
    // client-side (orgs.yaml), so a leftover row per run would eventually push new
    // orgs off the first page and this test would start failing on its own history.
    await page.getByText(EMAIL).first().click();
    await expect(page).toHaveURL(/orgs_edit\?id=/, { timeout: 15_000 });
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page).toHaveURL(/\/orgs$/, { timeout: 15_000 });
    await expect(page.getByText(EMAIL)).toHaveCount(0);
  });
});

// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import fs from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "share-modal");

function ensureScreenshotDir() {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function waitForFonts(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function gotoKitchenSink(page: Page) {
  await page.goto("/devportal/kitchen-sink", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await waitForFonts(page);
}

async function openShareModal(page: Page) {
  await page.getByRole("button", { name: "Open share modal" }).click();
  await expect(page.getByTestId("share-modal")).toBeVisible();
  await waitForFonts(page);
}

async function captureShareModal(page: Page, fileName: string) {
  const modal = page.getByTestId("share-modal");
  await expect(modal).toBeVisible();
  await waitForFonts(page);
  await modal.screenshot({ path: path.join(screenshotDir, fileName) });
}

test.describe("ShareModal", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await gotoKitchenSink(page);
  });

  test("captures default share modal state", async ({ page }) => {
    await openShareModal(page);

    await captureShareModal(page, "default.png");
  });

  test("captures copy icon hover state", async ({ page }) => {
    await openShareModal(page);

    await page.getByTestId("share-modal").getByRole("button", { name: "Copy share link" }).hover();
    await captureShareModal(page, "copy-hover.png");
  });
});

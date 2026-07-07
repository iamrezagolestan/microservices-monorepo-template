// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import fs from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "search-modal");
const searchText = "\u062c\u062f\u06cc\u062f\u062a\u0631\u06cc\u0646";
const emptyMessage =
  "\u0628\u0631\u0627\u06cc \u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u06af\u0641\u062a\u200c\u0648\u06af\u0648\u0647\u0627\u060c \u0639\u0628\u0627\u0631\u062a \u0645\u0648\u0631\u062f \u0646\u0638\u0631 \u062e\u0648\u062f \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f";

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

async function openSearchModal(page: Page) {
  await page.getByRole("button", { name: "Open search modal" }).click();
  await expect(page.getByTestId("search-modal")).toBeVisible();
  await waitForFonts(page);
}

async function captureSearchModal(page: Page, fileName: string) {
  const modal = page.getByTestId("search-modal");
  await expect(modal).toBeVisible();
  await waitForFonts(page);
  await modal.screenshot({ path: path.join(screenshotDir, fileName) });
}

test.describe("SearchModal", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await gotoKitchenSink(page);
  });

  test("captures empty search modal state", async ({ page }) => {
    await openSearchModal(page);

    await expect(page.getByTestId("search-modal-empty-state")).toBeVisible();
    await expect(page.getByText(emptyMessage)).toBeVisible();
    await captureSearchModal(page, "empty.png");
  });

  test("captures typed search modal results state", async ({ page }) => {
    await openSearchModal(page);

    await page.getByTestId("search-modal").getByRole("textbox").fill(searchText);
    await expect(page.getByTestId("search-modal-results")).toBeVisible();
    await expect(
      page.getByTestId("search-modal").getByRole("button", { name: searchText }),
    ).toHaveCount(4);
    await captureSearchModal(page, "results.png");
  });

  test("closes the search modal from the close button", async ({ page }) => {
    await openSearchModal(page);

    await page.getByTestId("search-modal").getByRole("button", { name: "Close search" }).click();
    await expect(page.getByTestId("search-modal")).toBeHidden();
  });

  test("closes the search modal from an outside click", async ({ page }) => {
    await openSearchModal(page);

    await page.mouse.click(20, 20);
    await expect(page.getByTestId("search-modal")).toBeHidden();
  });
});

// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import fs from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "notification");
const themes = ["dark", "light"] as const;

function ensureScreenshotDir() {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function waitForFonts(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function setTheme(page: Page, theme: (typeof themes)[number]) {
  await page.locator("html").evaluate((element, nextTheme) => {
    element.classList.remove("light-mode", "dark-mode");
    element.classList.add(`${nextTheme}-mode`);
  }, theme);
}

async function gotoKitchenSink(page: Page) {
  await page.goto("/devportal/kitchen-sink", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await waitForFonts(page);
}

async function showNotification(page: Page) {
  await page.getByRole("button", { name: "Show notification" }).click();
  await expect(page.getByTestId("usage-limit-notification")).toBeVisible();
  await waitForFonts(page);
  await page.waitForTimeout(200);
}

async function expectNotificationCentered(page: Page) {
  const box = await page.getByTestId("usage-limit-notification").boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();

  if (!box || !viewport) {
    return;
  }

  const viewportCenter = viewport.width / 2;
  const notificationCenter = box.x + box.width / 2;

  expect(Math.abs(notificationCenter - viewportCenter)).toBeLessThanOrEqual(2);
}

test.describe("Notification screenshots", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await gotoKitchenSink(page);
  });

  for (const theme of themes) {
    test(`capture ${theme} top-center notification`, async ({ page }) => {
      await setTheme(page, theme);
      await showNotification(page);
      await expectNotificationCentered(page);
      await page.getByTestId("usage-limit-notification").screenshot({
        path: path.join(screenshotDir, `${theme}-top-center.png`),
      });
    });
  }

  test("closes from the close button", async ({ page }) => {
    await showNotification(page);
    await page.getByRole("button", { name: "Close notification" }).click();
    await expect(page.getByTestId("usage-limit-notification")).toHaveCount(0);
  });
});

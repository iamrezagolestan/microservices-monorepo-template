// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import fs from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "main-logo");
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

async function captureMainLogo(page: Page, theme: (typeof themes)[number]) {
  await setTheme(page, theme);
  const logo = page.getByTestId("main-logo");
  await expect(logo).toBeVisible();
  await waitForFonts(page);
  await logo.screenshot({ path: path.join(screenshotDir, `${theme}.png`) });
}

test.describe("MainLogo screenshots", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await page.goto("/devportal/kitchen-sink", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await waitForFonts(page);
  });

  for (const theme of themes) {
    test(`capture ${theme} main logo`, async ({ page }) => {
      await captureMainLogo(page, theme);
    });
  }
});

// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import fs from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "first-chat-card");
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

async function captureFirstChatCard(page: Page, theme: (typeof themes)[number]) {
  await setTheme(page, theme);
  const card = page.getByTestId("first-chat-card");
  await expect(card).toBeVisible();
  await waitForFonts(page);
  await card.screenshot({ path: path.join(screenshotDir, `${theme}.png`) });
}

test.describe("FirstChatCard screenshots", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await page.goto("/devportal/kitchen-sink", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await waitForFonts(page);
  });

  for (const theme of themes) {
    test(`capture ${theme} first chat card`, async ({ page }) => {
      await captureFirstChatCard(page, theme);
    });
  }
});

import { test, expect, Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "input");

function ensureScreenshotDir() {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function captureInput(page: Page, testId: string, fileName: string) {
  const input = page.getByTestId(testId);
  await expect(input).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await input.screenshot({
    path: path.join(screenshotDir, fileName),
  });
}
test.describe("Input screenshots", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await page.goto("/devportal/kitchen-sink");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });
  test("capture default input", async ({ page }) => {
    await captureInput(page, "input-default", "default.png");
  });
  test("capture filled input", async ({ page }) => {
    await captureInput(page, "input-filled", "filled.png");
  });
  test("capture focused input", async ({ page }) => {
    const input = page.getByTestId("input-focused").locator("input");
    await input.focus();
    await captureInput(page, "input-focused", "focused.png");
  });
  test("capture disabled input", async ({ page }) => {
    await captureInput(page, "input-disabled", "disabled.png");
  });
});

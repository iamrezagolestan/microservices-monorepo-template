// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import fs from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "llm-select");
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

async function openKitchenSelect(page: Page) {
  await page.getByTestId("llm-select-trigger-button").click();
  await expect(page.getByTestId("llm-select-popover")).toBeVisible();
  await waitForFonts(page);
}

test.describe("LlmSelect screenshots", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await page.goto("/devportal/kitchen-sink", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await waitForFonts(page);
  });

  for (const theme of themes) {
    test(`capture ${theme} kitchen LLM select`, async ({ page }) => {
      await setTheme(page, theme);
      await openKitchenSelect(page);
      await page.getByTestId("llm-select-popover").screenshot({
        path: path.join(screenshotDir, `${theme}-kitchen.png`),
      });
    });
  }

  test("opens from the ChatBox AI tools button", async ({ page }) => {
    await setTheme(page, "light");
    await page
      .getByTestId("chatbox-desktop-empty")
      .getByRole("button", { name: "AI tools" })
      .click();
    await expect(page.getByTestId("llm-select-popover")).toBeVisible();
    await page.getByTestId("llm-select-popover").screenshot({
      path: path.join(screenshotDir, "light-chatbox-open.png"),
    });
  });

  test("closes after choosing a model", async ({ page }) => {
    await page.getByTestId("llm-select-trigger-button").click();
    await page.getByRole("option", { name: "Gemeni 3.5 جدیدترین مدل Open AI" }).click();
    await expect(page.getByTestId("llm-select-popover")).toHaveCount(0);
  });
});

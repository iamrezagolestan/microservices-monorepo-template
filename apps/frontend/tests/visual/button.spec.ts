// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import fs from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "button");
const hierarchies = ["primary", "secondary", "tertiary"] as const;
const iconHierarchies = ["primary", "secondary"] as const;
const sizes = ["sm", "md", "lg", "xl"] as const;
const states = ["default", "hover", "focused", "disabled", "loading"] as const;

function ensureScreenshotDir() {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function waitForFonts(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function captureButton(page: Page, testId: string, fileName: string) {
  const button = page.getByTestId(testId);
  await expect(button).toBeVisible();
  await waitForFonts(page);
  await button.screenshot({
    path: path.join(screenshotDir, fileName),
  });
}

async function prepareState(page: Page, testId: string, state: string) {
  const button = page.getByTestId(testId).locator("button, a").first();

  if (state === "hover") {
    await button.hover();
  }

  if (state === "focused") {
    await button.focus();
  }
}

function statesForHierarchy(hierarchy: (typeof hierarchies)[number]) {
  if (hierarchy === "tertiary") {
    return states.filter((state) => state !== "loading");
  }

  return states;
}

test.describe("Button screenshots", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await page.goto("/devportal/kitchen-sink", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await waitForFonts(page);
  });

  for (const hierarchy of hierarchies) {
    for (const size of sizes) {
      for (const state of statesForHierarchy(hierarchy)) {
        const testId = ["button", hierarchy, size, state].join("-");
        const fileName = `${hierarchy}-${size}-${state}.png`;

        test(`capture ${hierarchy} ${size} ${state} button`, async ({ page }) => {
          await prepareState(page, testId, state);
          await captureButton(page, testId, fileName);
        });
      }
    }
  }

  for (const hierarchy of iconHierarchies) {
    for (const size of sizes) {
      for (const state of states) {
        const testId = ["button", hierarchy, size, state, "icon-only"].join("-");
        const fileName = `${hierarchy}-${size}-${state}-icon-only.png`;

        test(`capture ${hierarchy} ${size} ${state} icon button`, async ({ page }) => {
          await prepareState(page, testId, state);
          await captureButton(page, testId, fileName);
        });
      }
    }
  }
});

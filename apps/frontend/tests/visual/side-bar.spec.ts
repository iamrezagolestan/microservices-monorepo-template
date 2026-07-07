// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import fs from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "side-bar");

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
  await waitForFonts(page);
}

test.describe("SideBar", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await gotoKitchenSink(page);
  });

  test("captures expanded desktop sidebar", async ({ page }) => {
    const sideBar = page.getByTestId("kitchen-sidebar");
    await expect(sideBar).toBeVisible();
    await expect(sideBar.getByText("یونی پرامپت").last()).toBeVisible();
    await expect(sideBar.getByText("جستجو")).toBeVisible();
    await expect(sideBar.getByText("سابقه چت")).toBeVisible();
    await expect(sideBar.locator('[aria-current="page"]')).toHaveCount(1);
    await sideBar.locator('[aria-current="page"] + button').click();
    await expect(sideBar.locator('[aria-current="page"]')).toHaveCount(1);
    await sideBar.screenshot({ path: path.join(screenshotDir, "expanded.png") });
  });

  test("captures collapsed desktop sidebar and extends it", async ({ page }) => {
    const sideBar = page.getByTestId("kitchen-sidebar");
    await sideBar.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(sideBar.getByRole("button", { name: "Extend sidebar" })).toBeVisible();
    await expect(sideBar.getByText("جستجو")).toBeHidden();
    await sideBar.screenshot({ path: path.join(screenshotDir, "collapsed.png") });

    await sideBar.getByRole("button", { name: "Extend sidebar" }).click();
    await expect(sideBar.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
    await expect(sideBar.getByText("جستجو")).toBeVisible();
  });

  test("opens and closes mobile sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoKitchenSink(page);

    const sideBar = page.getByTestId("kitchen-sidebar");
    const openButton = sideBar.getByRole("button", { name: "Open sidebar" });
    await expect(openButton).toBeVisible();
    await openButton.click();
    const closeButton = page.getByRole("button", { exact: true, name: "Close sidebar" });
    await expect(closeButton).toBeVisible();
    await sideBar.screenshot({ path: path.join(screenshotDir, "mobile-open.png") });

    await closeButton.click();
    await expect(closeButton).toBeHidden();
  });
});

// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import fs from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "type-box");
const originalText =
  "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.";
const editedText = "متن ویرایش شده";

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

async function getLocatorHeight(locator: ReturnType<Page["locator"]>) {
  const box = await locator.boundingBox();

  if (!box) {
    throw new Error("Expected locator to have a bounding box.");
  }

  return box.height;
}

test.describe("TypeBox", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await gotoKitchenSink(page);
  });

  test("captures default type box", async ({ page }) => {
    const typeBox = page.getByTestId("typebox-default");
    await expect(typeBox).toBeVisible();
    await typeBox.screenshot({ path: path.join(screenshotDir, "default.png") });
  });

  test("switches to an editable input from the edit action", async ({ page }) => {
    const typeBox = page.getByTestId("typebox-default");
    const readHeight = await getLocatorHeight(typeBox.locator("p"));

    await typeBox.getByRole("button", { name: "Edit text" }).click();

    const input = typeBox.getByRole("textbox", { name: "Type box text" });
    await expect(input).toBeVisible();
    await expect.poll(() => getLocatorHeight(input)).toBeCloseTo(readHeight, 0);
    await expect(typeBox.getByRole("button", { name: "ویرایش" })).toBeVisible();
    await expect(typeBox.getByRole("button", { name: "لغو" })).toBeVisible();
    await typeBox.screenshot({ path: path.join(screenshotDir, "editing.png") });
  });

  test("saves and cancels edited text", async ({ page }) => {
    const typeBox = page.getByTestId("typebox-default");
    await typeBox.getByRole("button", { name: "Edit text" }).click();
    await typeBox.getByRole("textbox", { name: "Type box text" }).fill(editedText);
    await typeBox.getByRole("button", { name: "ویرایش" }).click();
    await expect(typeBox.getByText(editedText)).toBeVisible();

    await typeBox.getByRole("button", { name: "Edit text" }).click();
    await typeBox.getByRole("textbox", { name: "Type box text" }).fill(originalText);
    await typeBox.getByRole("button", { name: "لغو" }).click();
    await expect(typeBox.getByText(editedText)).toBeVisible();
  });

  test("copies the current text", async ({ page }) => {
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          value: "",
          writeText(text: string) {
            this.value = text;
            return Promise.resolve();
          },
        },
      });
    });

    const typeBox = page.getByTestId("typebox-default");
    await typeBox.getByRole("button", { name: "Copy text" }).click();

    const copiedText = await page.evaluate(() => {
      return (navigator.clipboard as unknown as { value: string }).value;
    });
    expect(copiedText).toContain("لورم ایپسوم");
  });

  test("shows tooltips for icon actions", async ({ page }) => {
    const typeBox = page.getByTestId("typebox-default");

    await typeBox.getByRole("button", { name: "Edit text" }).focus();
    await expect(page.getByText("Edit")).toBeVisible();

    await typeBox.getByRole("button", { name: "Copy text" }).focus();
    await expect(page.getByText("Copy")).toBeVisible();
  });
});

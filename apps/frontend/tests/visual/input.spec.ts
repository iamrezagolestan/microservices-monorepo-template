import { test, expect, Page } from "@playwright/test";
import fs from "fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const getInput = (page: Page, testId: string) => page.getByTestId(testId).locator("input");

function flattenToWhite(image: PNG) {
  for (let i = 0; i < image.data.length; i += 4) {
    const alpha = image.data[i + 3];

    if (alpha < 255) {
      const opacity = alpha / 255;

      image.data[i] = Math.round(image.data[i] * opacity + 255 * (1 - opacity));

      image.data[i + 1] = Math.round(image.data[i + 1] * opacity + 255 * (1 - opacity));

      image.data[i + 2] = Math.round(image.data[i + 2] * opacity + 255 * (1 - opacity));

      image.data[i + 3] = 255;
    }
  }
}

test.describe("Input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/devportal/kitchen-sink");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("default input should render correctly", async ({ page }) => {
    const input = getInput(page, "input-default");
    const component = page.getByTestId("input-default");

    const screenshot = await component.screenshot();

    fs.writeFileSync("tests/actual/input-default.png", screenshot);

    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    const figmaReferenceImage = PNG.sync.read(
      fs.readFileSync("tests/figma-reference/input/default.png"),
    );
    const actualImage = PNG.sync.read(screenshot);

    flattenToWhite(figmaReferenceImage);
    flattenToWhite(actualImage);

    const { width, height } = figmaReferenceImage;
    const diff = new PNG({ width, height });

    const diffPixels = pixelmatch(
      figmaReferenceImage.data,
      actualImage.data,
      diff.data,
      width,
      height,
      {
        threshold: 0.12,
        includeAA: false,
        diffMask: true,
      },
    );

    fs.writeFileSync("tests/diff/input/default.png", PNG.sync.write(diff));
    expect(diffPixels).toBeLessThanOrEqual(500);
  });

  test("filled input should contain value", async ({ page }) => {
    const input = getInput(page, "input-filled");

    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    await expect(input).toHaveValue("olivia@untitledui.com");
  });

  test("focused input should be focusable", async ({ page }) => {
    const input = getInput(page, "input-focused");

    await expect(input).toBeVisible();
    await input.focus();
    await expect(input).toBeFocused();
  });

  test("disabled input should be disabled", async ({ page }) => {
    const input = getInput(page, "input-disabled");

    expect(input).toBeVisible();
    expect(input).toBeDisabled();
  });
});

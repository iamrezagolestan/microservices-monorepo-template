import fs from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const INPUT_CASES = [
  {
    name: "default",
    testId: "input-default",
    reference: "default.png",
  },
  {
    name: "filled",
    testId: "input-filled",
    reference: "filled.png",
  },
  {
    name: "focused",
    testId: "input-focused",
    reference: "focused.png",
  },
  {
    name: "disabled",
    testId: "input-disabled",
    reference: "disabled.png",
  },
];

const ROOT = "tests/visual";
const PIXEL_THRESHOLD = 0.2;
const MAX_DIFF_RATIO = 0.07;

function flattenTransparentToWhite(image: PNG) {
  for (let index = 0; index < image.data.length; index += 4) {
    const alpha = image.data[index + 3];

    if (alpha < 255) {
      const opacity = alpha / 255;

      image.data[index] = Math.round(image.data[index] * opacity + 255 * (1 - opacity));
      image.data[index + 1] = Math.round(image.data[index + 1] * opacity + 255 * (1 - opacity));
      image.data[index + 2] = Math.round(image.data[index + 2] * opacity + 255 * (1 - opacity));
      image.data[index + 3] = 255;
    }
  }

  return image;
}

function compareImages(params: {
  name: string;
  referencePath: string;
  actualPath: string;
  diffPath: string;
}) {
  const reference = flattenTransparentToWhite(PNG.sync.read(fs.readFileSync(params.referencePath)));

  const actual = flattenTransparentToWhite(PNG.sync.read(fs.readFileSync(params.actualPath)));

  if (reference.width !== actual.width || reference.height !== actual.height) {
    throw new Error(
      `[${params.name}] Image size mismatch. Reference: ${reference.width}x${reference.height}, Actual: ${actual.width}x${actual.height}`,
    );
  }

  const diff = new PNG({
    width: reference.width,
    height: reference.height,
  });

  const mismatchedPixels = pixelmatch(
    reference.data,
    actual.data,
    diff.data,
    reference.width,
    reference.height,
    {
      threshold: PIXEL_THRESHOLD,
      includeAA: false,
    },
  );

  fs.writeFileSync(params.diffPath, PNG.sync.write(diff));

  const totalPixels = reference.width * reference.height;
  const diffRatio = mismatchedPixels / totalPixels;

  if (diffRatio > MAX_DIFF_RATIO) {
    throw new Error(
      `[${params.name}] Visual diff too high: ${(diffRatio * 100).toFixed(2)}%. Max allowed: ${(MAX_DIFF_RATIO * 100).toFixed(2)}%. Check ${params.diffPath}`,
    );
  }
}

test.describe("Input visual regression", () => {
  for (const inputCase of INPUT_CASES) {
    test(`${inputCase.name} matches figma reference`, async ({ page }) => {
      await page.goto("http://localhost:3000/devportal/kitchen-sink");

      const actualPath = path.join(ROOT, "actual", "input", `${inputCase.name}.png`);

      const referencePath = path.join(ROOT, "reference", "input", inputCase.reference);

      const diffPath = path.join(ROOT, "diff", "input", `${inputCase.name}.png`);

      fs.mkdirSync(path.dirname(actualPath), { recursive: true });
      fs.mkdirSync(path.dirname(diffPath), { recursive: true });

      const target = page.getByTestId(inputCase.testId);

      await target.waitFor({
        state: "visible",
        timeout: 5000,
      });

      if (inputCase.name === "focused") {
        await target.locator("input").focus();
      }

      await target.screenshot({
        path: actualPath,
        animations: "disabled",
        caret: "hide",
        scale: "css",
      });

      compareImages({
        name: inputCase.name,
        referencePath,
        actualPath,
        diffPath,
      });
    });
  }
});

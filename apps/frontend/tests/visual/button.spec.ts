import fs from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const BUTTON_CASES = [
  {
    name: "primary",
    testId: "button-primary",
    reference: "primary.png",
  },
  {
    name: "secondary",
    testId: "button-secondary",
    reference: "secondary.png",
  },
  {
    name: "tertiary",
    testId: "button-tertiary",
    reference: "tertiary.png",
  },
  {
    name: "destructive",
    testId: "button-destructive",
    reference: "destructive.png",
  },
  {
    name: "disabled",
    testId: "button-disabled",
    reference: "disabled.png",
  },
  {
    name: "focused",
    testId: "button-focused",
    reference: "focused.png",
  },
  {
    name: "hover",
    testId: "button-hover",
    reference: "hover.png",
  },
  {
    name: "with-icon",
    testId: "button-with-icon",
    reference: "with-icon.png",
  },
];

const ROOT = "tests/visual";

const PIXEL_THRESHOLD = 0.2;
const MAX_DIFF_RATIO = 0.05;

function flattenTransparentToWhite(image: PNG) {
  for (let index = 0; index < image.data.length; index += 4) {
    const alpha = image.data[index + 3];

    if (alpha < 255) {
      const opacity = alpha / 255;

      image.data[index] = Math.round(
        image.data[index] * opacity + 255 * (1 - opacity),
      );

      image.data[index + 1] = Math.round(
        image.data[index + 1] * opacity + 255 * (1 - opacity),
      );

      image.data[index + 2] = Math.round(
        image.data[index + 2] * opacity + 255 * (1 - opacity),
      );

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
  const reference = flattenTransparentToWhite(
    PNG.sync.read(fs.readFileSync(params.referencePath)),
  );

  const actual = flattenTransparentToWhite(
    PNG.sync.read(fs.readFileSync(params.actualPath)),
  );

  if (reference.width !== actual.width) {
    throw new Error(
      `[${params.name}] Width mismatch. Reference: ${reference.width}, Actual: ${actual.width}`,
    );
  }

  if (reference.height !== actual.height) {
    throw new Error(
      `[${params.name}] Height mismatch. Reference: ${reference.height}, Actual: ${actual.height}`,
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
      `[${params.name}] Visual diff too high: ${(diffRatio * 100).toFixed(
        2,
      )}%. Max allowed: ${(MAX_DIFF_RATIO * 100).toFixed(
        2,
      )}%. Check ${params.diffPath}`,
    );
  }
}

test.describe("Button visual regression", () => {
  for (const buttonCase of BUTTON_CASES) {
    test(`${buttonCase.name} matches figma reference`, async ({ page }) => {
      await page.goto("http://localhost:3000/devportal/kitchen-sink");

      await page.evaluate(() => document.fonts.ready);

      const actualPath = path.join(
        ROOT,
        "actual",
        "button",
        `${buttonCase.name}.png`,
      );

      const referencePath = path.join(
        ROOT,
        "reference",
        "button",
        buttonCase.reference,
      );

      const diffPath = path.join(
        ROOT,
        "diff",
        "button",
        `${buttonCase.name}.png`,
      );

      fs.mkdirSync(path.dirname(actualPath), {
        recursive: true,
      });

      fs.mkdirSync(path.dirname(diffPath), {
        recursive: true,
      });

      const target = page.getByTestId(buttonCase.testId);

      await target.waitFor({
        state: "visible",
        timeout: 5000,
      });

      const button = target.locator("button");

      if (buttonCase.name === "focused") {
        await button.focus();
      }

      if (buttonCase.name === "hover") {
        await button.hover();
      }

      await target.screenshot({
        path: actualPath,
        animations: "disabled",
        caret: "hide",
        scale: "css",
      });

      compareImages({
        name: buttonCase.name,
        referencePath,
        actualPath,
        diffPath,
      });
    });
  }
});

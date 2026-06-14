import { test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

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

function compareImages(params: {
  name: string;
  referencePath: string;
  actualPath: string;
  diffPath: string;
}) {
  const reference = PNG.sync.read(fs.readFileSync(params.referencePath));
  const actual = PNG.sync.read(fs.readFileSync(params.actualPath));

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
      threshold: 0.1,
    },
  );

  fs.writeFileSync(params.diffPath, PNG.sync.write(diff));

  const totalPixels = reference.width * reference.height;
  const diffRatio = mismatchedPixels / totalPixels;

  if (diffRatio > 0.03) {
    throw new Error(
      `[${params.name}] Visual diff too high: ${(diffRatio * 100).toFixed(2)}%. Check ${params.diffPath}`,
    );
  }
}

test.describe("input visual regression", () => {
  for (const inputCase of INPUT_CASES) {
    test(`${inputCase.name} matches figma reference`, async ({ page }) => {
      await page.goto("http://localhost:3000/devportal/kitchen-sink");

      const actualPath = path.join(
        ROOT,
        "actual",
        "input",
        `${inputCase.name}.png`,
      );

      const referencePath = path.join(
        ROOT,
        "reference",
        "input",
        inputCase.reference,
      );

      const diffPath = path.join(
        ROOT,
        "diff",
        "input",
        `${inputCase.name}.png`,
      );

      fs.mkdirSync(path.dirname(actualPath), { recursive: true });
      fs.mkdirSync(path.dirname(diffPath), { recursive: true });

      const target = page.getByTestId(inputCase.testId);

      await target.screenshot({
        path: actualPath,
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
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import fs from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: Playwright visual tests write screenshots to disk.
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "chat-box");
const themes = ["dark", "light"] as const;
const desktopStates = ["empty", "attached", "long", "loading"] as const;
const mobileStates = ["empty", "long"] as const;
const editText = "سلام";
const typedText = "متن تازه";
const overflowText = Array.from({ length: 18 }, () => editText).join("\n");

function ensureScreenshotDir() {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function waitForFonts(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function captureChatBox(page: Page, testId: string, fileName: string) {
  const chatBox = page.getByTestId(testId);
  await expect(chatBox).toBeVisible();
  await waitForFonts(page);
  await chatBox.screenshot({ path: path.join(screenshotDir, fileName) });
}

async function setTheme(page: Page, theme: (typeof themes)[number]) {
  await page.locator("html").evaluate((element, nextTheme) => {
    element.setAttribute("data-theme", nextTheme);
  }, theme);
}

function registerScreenshotTests() {
  for (const theme of themes) {
    for (const state of desktopStates) {
      test(`capture ${theme} desktop ${state} chat box`, async ({ page }) => {
        await setTheme(page, theme);
        await captureChatBox(page, ["chatbox", "desktop", state].join("-"), `${theme}-desktop-${state}.png`);
      });
    }
  }

  for (const state of mobileStates) {
    test(`capture light mobile ${state} chat box`, async ({ page }) => {
      await setTheme(page, "light");
      await captureChatBox(page, ["chatbox", "mobile", state].join("-"), `light-mobile-${state}.png`);
    });
  }
}

function registerLayoutBehaviorTests() {
  test("places action buttons on the physical left in RTL layout and keeps Figma icon order", async ({
    page,
  }) => {
    const chatBox = page.getByTestId("chatbox-desktop-empty");
    const sendButton = chatBox.getByRole("button", { name: "Send" });
    const attachButton = chatBox.getByRole("button", { name: "Attach file" });
    const aiButton = chatBox.getByRole("button", { name: "AI tools" });
    const textarea = chatBox.locator("textarea");
    const sendBox = await sendButton.boundingBox();
    const attachBox = await attachButton.boundingBox();
    const aiBox = await aiButton.boundingBox();
    const textareaBox = await textarea.boundingBox();
    expect(sendBox).not.toBeNull();
    expect(attachBox).not.toBeNull();
    expect(aiBox).not.toBeNull();
    expect(textareaBox).not.toBeNull();
    expect(sendBox?.x).toBeLessThan(attachBox?.x ?? 0);
    expect(attachBox?.x).toBeLessThan(aiBox?.x ?? 0);
    expect(aiBox?.x).toBeLessThan(textareaBox?.x ?? 0);
  });
}

function registerEditingBehaviorTests() {
  test("allows text editing and toggles send disabled state from trimmed content", async ({ page }) => {
    const chatBox = page.getByTestId("chatbox-desktop-empty");
    const textarea = chatBox.locator("textarea");
    const sendButton = chatBox.getByRole("button", { name: "Send" });
    await expect(sendButton).toBeDisabled();
    await textarea.click();
    await textarea.fill("   ");
    await expect(sendButton).toBeDisabled();
    await textarea.fill(editText);
    await expect(textarea).toHaveValue(editText);
    await expect(sendButton).toBeEnabled();
    await textarea.press("Control+A");
    await textarea.press("Backspace");
    await expect(textarea).toHaveValue("");
    await expect(sendButton).toBeDisabled();
    await textarea.pressSequentially(typedText);
    await expect(textarea).toHaveValue(typedText);
    await expect(sendButton).toBeEnabled();
  });
}

function registerActionBehaviorTests() {
  test("shows tooltips above the container", async ({ page }) => {
    const chatBox = page.getByTestId("chatbox-desktop-empty");
    const sendButton = chatBox.getByRole("button", { name: "Send" });
    await chatBox.locator("textarea").fill(editText);
    await expect(sendButton).toBeEnabled();
    await sendButton.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toContainText("Send");
    const chatBoxBounds = await chatBox.boundingBox();
    const tooltipBounds = await tooltip.boundingBox();
    expect(chatBoxBounds).not.toBeNull();
    expect(tooltipBounds).not.toBeNull();
    const tooltipBottom = (tooltipBounds?.y ?? 0) + (tooltipBounds?.height ?? 0);
    expect(tooltipBottom).toBeLessThanOrEqual(chatBoxBounds?.y ?? 0);
    expect(tooltipBounds?.y).toBeGreaterThanOrEqual(0);
  });

  test("shows attachment preview from attachment state", async ({ page }) => {
    const attached = page.getByTestId("chatbox-desktop-attached");
    await expect(attached.getByRole("button", { name: "Open folder" })).toBeVisible();
    await expect(attached.getByRole("button", { name: "PDF attachment" })).toBeVisible();
    await expect(attached.getByRole("button", { name: "File attachment" })).toBeVisible();
  });

  test("matches Figma upload preview geometry", async ({ page }) => {
    const attached = page.getByTestId("chatbox-desktop-attached");
    const preview = attached.locator('[data-slot="attachment-preview"]');
    const folderButton = attached.getByRole("button", { name: "Open folder" });
    const pdfButton = attached.getByRole("button", { name: "PDF attachment" });
    const fileButton = attached.getByRole("button", { name: "File attachment" });
    const previewBox = await preview.boundingBox();
    const folderBox = await folderButton.boundingBox();
    const pdfBox = await pdfButton.boundingBox();
    const fileBox = await fileButton.boundingBox();
    expect(previewBox).not.toBeNull();
    expect(folderBox).not.toBeNull();
    expect(pdfBox).not.toBeNull();
    expect(fileBox).not.toBeNull();
    expect(previewBox?.height).toBe(62);
    expect(folderBox?.width).toBe(24);
    expect(folderBox?.height).toBe(24);
    expect(pdfBox?.width).toBe(24);
    expect(fileBox?.width).toBe(24);
    expect((folderBox?.y ?? 0) - (previewBox?.y ?? 0)).toBe(7);
    expect((pdfBox?.x ?? 0) - ((folderBox?.x ?? 0) + (folderBox?.width ?? 0))).toBe(8);
    expect((fileBox?.x ?? 0) - ((pdfBox?.x ?? 0) + (pdfBox?.width ?? 0))).toBe(8);
    expect((previewBox?.x ?? 0) + (previewBox?.width ?? 0) - ((fileBox?.x ?? 0) + (fileBox?.width ?? 0))).toBe(
      16,
    );
  });

  test("adds attachment preview when the attach action changes component state", async ({ page }) => {
    const chatBox = page.getByTestId("chatbox-desktop-empty");
    await expect(chatBox.getByRole("button", { name: "File attachment" })).toHaveCount(0);
    await chatBox.getByRole("button", { name: "Attach file" }).click();
    await expect(chatBox.getByRole("button", { name: "File attachment" })).toBeVisible();
    await expect(chatBox.locator("[data-state]")).toHaveAttribute("data-state", "attachments");
  });
}

function registerScrollBehaviorTests() {
  test("auto-grows textarea progressively until the token max height and then scrolls", async ({ page }) => {
    const textarea = page.getByTestId("chatbox-desktop-empty").locator("textarea");
    await expect(textarea).toBeVisible();
    await textarea.fill(editText);
    const oneLineHeight = await textarea.evaluate((element) => element.clientHeight);
    await textarea.fill([editText, editText].join("\n"));
    const twoLineHeight = await textarea.evaluate((element) => element.clientHeight);
    await textarea.fill([editText, editText, editText].join("\n"));
    const threeLineHeight = await textarea.evaluate((element) => element.clientHeight);
    expect(oneLineHeight).toBeLessThan(twoLineHeight);
    expect(twoLineHeight).toBeLessThan(threeLineHeight);

    await textarea.fill(overflowText);
    const overflowMetrics = await textarea.evaluate((element) => {
      const computedStyle = getComputedStyle(element);
      return {
        clientHeight: element.clientHeight,
        maxHeight: Number.parseFloat(computedStyle.maxHeight),
        overflowY: computedStyle.overflowY,
        scrollHeight: element.scrollHeight,
      };
    });
    expect(threeLineHeight).toBeLessThan(overflowMetrics.maxHeight);
    expect(overflowMetrics.clientHeight).toBeLessThanOrEqual(overflowMetrics.maxHeight);
    expect(overflowMetrics.scrollHeight).toBeGreaterThan(overflowMetrics.clientHeight);
    expect(overflowMetrics.overflowY).toBe("auto");

    await textarea.fill(editText);
    const compactMetrics = await textarea.evaluate((element) => {
      const computedStyle = getComputedStyle(element);
      return {
        clientHeight: element.clientHeight,
        minHeight: Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--size-chat-textarea-min-height"),
        ),
        overflowY: computedStyle.overflowY,
      };
    });
    expect(compactMetrics.clientHeight).toBe(compactMetrics.minHeight);
    expect(compactMetrics.overflowY).toBe("hidden");
  });

  test("long chat textarea keeps right-side native scrollbar with RTL text alignment", async ({ page }) => {
    const textarea = page.getByTestId("chatbox-desktop-long").locator("textarea");
    await expect(textarea).toBeVisible();
    const metrics = await textarea.evaluate((element) => {
      element.scrollTop = 80;
      return {
        clientHeight: element.clientHeight,
        direction: getComputedStyle(element).direction,
        scrollHeight: element.scrollHeight,
        scrollTop: element.scrollTop,
        textAlign: getComputedStyle(element).textAlign,
      };
    });
    expect(metrics.direction).toBe("ltr");
    expect(metrics.textAlign).toBe("right");
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
    expect(metrics.scrollTop).toBeGreaterThan(0);
  });
}

test.describe("ChatBox screenshots", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await page.goto("/devportal/kitchen-sink", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await waitForFonts(page);
  });

  registerScreenshotTests();
  registerLayoutBehaviorTests();
  registerEditingBehaviorTests();
  registerActionBehaviorTests();
  registerScrollBehaviorTests();
});

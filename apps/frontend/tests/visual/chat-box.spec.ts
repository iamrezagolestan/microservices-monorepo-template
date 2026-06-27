import { expect, type Page, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const screenshotDir = path.join(process.cwd(), "tests", "actual", "chat-box");
const themes = ["dark", "light"] as const;
const desktopVariants = ["default", "edge-1", "edge-2", "edge-3", "edge-4", "edge-5", "edge-6", "edge-7"] as const;
const specialVariants = ["uploader", "long", "loading"] as const;
const mobileVariants = ["default", "long"] as const;
const editText = "\u0633\u0644\u0627\u0645";
const typedText = "\u0645\u062a\u0646 \u062a\u0627\u0632\u0647";

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

test.describe("ChatBox screenshots", () => {
  test.beforeEach(async ({ page }) => {
    ensureScreenshotDir();
    await page.goto("/devportal/kitchen-sink", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await waitForFonts(page);
  });

  for (const theme of themes) {
    for (const variant of desktopVariants) {
      test(`capture ${theme} desktop ${variant} chat box`, async ({ page }) => {
        await captureChatBox(page, ["chatbox", theme, "desktop", variant].join("-"), `${theme}-desktop-${variant}.png`);
      });
    }
  }

  for (const variant of specialVariants) {
    test(`capture light desktop ${variant} chat box`, async ({ page }) => {
      await captureChatBox(page, ["chatbox", "light", "desktop", variant].join("-"), `light-desktop-${variant}.png`);
    });
  }

  for (const variant of mobileVariants) {
    test(`capture light mobile ${variant} chat box`, async ({ page }) => {
      await captureChatBox(page, ["chatbox", "light", "mobile", variant].join("-"), `light-mobile-${variant}.png`);
    });
  }

  test("places action buttons on the physical left in RTL layout and keeps Figma icon order", async ({ page }) => {
    const chatBox = page.getByTestId("chatbox-light-desktop-default");
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
  test("allows text editing and toggles send disabled state from trimmed content", async ({ page }) => {
    const chatBox = page.getByTestId("chatbox-light-desktop-default");
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

  test("shows tooltips for action buttons", async ({ page }) => {
    const chatBox = page.getByTestId("chatbox-light-desktop-default");
    const sendButton = chatBox.getByRole("button", { name: "Send" });
    await chatBox.locator("textarea").fill(editText);
    await expect(sendButton).toBeEnabled();
    await sendButton.hover();
    await expect(page.getByRole("tooltip")).toContainText("Send");
  });

  test("uses real buttons for uploader actions", async ({ page }) => {
    const uploader = page.getByTestId("chatbox-light-desktop-uploader");
    await expect(uploader.getByRole("button", { name: "Open folder" })).toBeVisible();
    await expect(uploader.getByRole("button", { name: "PDF attachment" })).toBeVisible();
    await expect(uploader.getByRole("button", { name: "File attachment" })).toBeVisible();
  });

  test("long chat textarea scrolls with native RTL scrollbar", async ({ page }) => {
    const textarea = page.getByTestId("chatbox-light-desktop-long").locator("textarea");
    await expect(textarea).toBeVisible();
    const metrics = await textarea.evaluate((element) => {
      element.scrollTop = 80;
      return {
        clientHeight: element.clientHeight,
        direction: getComputedStyle(element).direction,
        textAlign: getComputedStyle(element).textAlign,
        scrollHeight: element.scrollHeight,
        scrollTop: element.scrollTop,
      };
    });
    expect(metrics.direction).toBe("ltr");
    expect(metrics.textAlign).toBe("right");
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
    expect(metrics.scrollTop).toBeGreaterThan(0);
  });
});
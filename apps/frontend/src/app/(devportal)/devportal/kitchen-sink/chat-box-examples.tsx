"use client";

import { ChatBox, type ChatBoxTheme, type ChatBoxVariant } from "@/components/ui";

const desktopVariants: ChatBoxVariant[] = [
  "default",
  "edge-1",
  "edge-2",
  "edge-3",
  "edge-4",
  "edge-5",
  "edge-6",
  "edge-7",
];
const themes: ChatBoxTheme[] = ["dark", "light"];

function chatBoxTestId(parts: string[]) {
  return parts.join("-");
}

export function ChatBoxExamples() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid w-full grid-cols-2 gap-x-8 gap-y-5 bg-(--chatbox-canvas-bg) p-2">
        {themes.map((theme) => (
          <div className="flex flex-col gap-5" key={theme}>
            {desktopVariants.map((variant) => (
              <ChatBox
                data-testid={chatBoxTestId(["chatbox", theme, "desktop", variant])}
                key={variant}
                theme={theme}
                variant={variant}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5 bg-(--chatbox-canvas-bg) p-2">
        <ChatBox data-testid="chatbox-light-desktop-uploader" theme="light" variant="uploader" />
        <ChatBox data-testid="chatbox-light-desktop-long" theme="light" variant="long" />
        <ChatBox data-testid="chatbox-light-desktop-loading" theme="light" variant="loading" />
        <ChatBox data-testid="chatbox-light-mobile-default" device="mobile" theme="light" variant="default" />
        <ChatBox data-testid="chatbox-light-mobile-long" device="mobile" theme="light" variant="long" />
      </div>
    </div>
  );
}

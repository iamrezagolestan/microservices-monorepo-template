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
      <div className="grid w-full grid-cols-1 gap-x-8 gap-y-5 bg-(--chatbox-canvas-bg) p-2 lg:grid-cols-2">
        {themes.map((theme) => (
          <div className="flex flex-col gap-5" key={theme}>
            {desktopVariants.map((variant) => (
              <div className="w-full max-w-(--chatbox-width-desktop)" key={variant}>
                <ChatBox
                  data-testid={chatBoxTestId(["chatbox", theme, "desktop", variant])}
                  theme={theme}
                  variant={variant}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5 bg-(--chatbox-canvas-bg) p-2">
        <div className="w-full max-w-(--chatbox-width-desktop)">
          <ChatBox data-testid="chatbox-light-desktop-uploader" theme="light" variant="uploader" />
        </div>
        <div className="w-full max-w-(--chatbox-width-desktop)">
          <ChatBox data-testid="chatbox-light-desktop-long" theme="light" variant="long" />
        </div>
        <div className="w-full max-w-(--chatbox-width-desktop)">
          <ChatBox data-testid="chatbox-light-desktop-loading" theme="light" variant="loading" />
        </div>
        <div className="w-full max-w-(--chatbox-width-mobile)">
          <ChatBox data-testid="chatbox-light-mobile-default" theme="light" variant="default" />
        </div>
        <div className="w-full max-w-(--chatbox-width-mobile)">
          <ChatBox data-testid="chatbox-light-mobile-long" theme="light" variant="long" />
        </div>
      </div>
    </div>
  );
}

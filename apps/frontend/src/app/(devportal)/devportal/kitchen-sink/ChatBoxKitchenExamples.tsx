"use client";

import { ChatBox, type ChatAttachment } from "@/components/ui";

const attachments: ChatAttachment[] = [
  { id: "folder", name: "Open folder", type: "folder" },
  { id: "pdf", name: "PDF attachment", type: "pdf" },
  { id: "file", name: "File attachment", type: "file" },
];

const longMessage = Array.from(
  { length: 10 },
  () =>
    "این یک متن بلند برای بررسی رشد خودکار تکست اریا است. وقتی متن از ارتفاع مجاز طراحی بیشتر شود، باید در همان ارتفاع بماند و اسکرول داخلی داشته باشد.",
).join("\n");

function ChatBoxPreview({
  children,
  testId,
  width,
}: {
  children: React.ReactNode;
  testId: string;
  width: string;
}) {
  return (
    <div className={width} data-testid={testId}>
      {children}
    </div>
  );
}

export function ChatBoxKitchenExamples() {
  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="flex w-full flex-col gap-9 p-4">
        <div className="flex w-[744px] flex-col gap-9">
          <ChatBoxPreview testId="chatbox-desktop-empty" width="w-full">
            <ChatBox />
          </ChatBoxPreview>

          <ChatBoxPreview testId="chatbox-desktop-attached" width="w-full">
            <ChatBox defaultAttachments={attachments} />
          </ChatBoxPreview>

          <ChatBoxPreview testId="chatbox-desktop-long" width="w-full">
            <ChatBox defaultValue={longMessage} />
          </ChatBoxPreview>

          <ChatBoxPreview testId="chatbox-desktop-loading" width="w-full">
            <ChatBox isLoading />
          </ChatBoxPreview>
        </div>

        <div className="flex w-[390px] flex-col gap-9">
          <ChatBoxPreview testId="chatbox-mobile-empty" width="w-full">
            <ChatBox />
          </ChatBoxPreview>

          <ChatBoxPreview testId="chatbox-mobile-long" width="w-full">
            <ChatBox defaultValue={longMessage} />
          </ChatBoxPreview>
        </div>
      </div>
    </div>
  );
}

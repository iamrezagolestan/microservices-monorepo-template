"use client";

import { Attachment01, File01, Folder, Paperclip, Send03, Stars01, Stop } from "@untitledui/icons";
import type { ChangeEvent, ChangeEventHandler, FC, Ref, RefObject } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "../Button/Button";
import { TextAreaBase } from "../TextArea/TextArea";

type ButtonIcon = FC<{ className?: string; "data-icon"?: string }>;

export type ChatAttachment = {
  id: string;
  name: string;
  type?: "file" | "folder" | "pdf";
};

export type ChatBoxProps = {
  attachments?: ChatAttachment[];
  className?: string;
  defaultAttachments?: ChatAttachment[];
  defaultValue?: string;
  isLoading?: boolean;
  onAttachmentsChange?: (attachments: ChatAttachment[]) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
};

const defaultPlaceholder = "از chat gpt 3/5 بپرسید";

function readPixelToken(name: string, fallback: number) {
  const rawValue = getComputedStyle(document.documentElement).getPropertyValue(name);
  const parsedValue = Number.parseFloat(rawValue);

  if (Number.isFinite(parsedValue)) {
    return parsedValue;
  }

  return fallback;
}

function ActionButton({
  "aria-label": ariaLabel,
  icon: Icon,
  isDisabled,
  onPress,
  tooltip,
}: {
  "aria-label": string;
  icon: ButtonIcon;
  isDisabled?: boolean;
  onPress?: () => void;
  tooltip: string;
}) {
  return (
    <div className="group/chat-action relative z-10">
      <Button
        aria-label={ariaLabel}
        color="tertiary"
        iconLeading={Icon}
        isDisabled={isDisabled}
        noTextPadding
        onPress={onPress}
        size="sm"
        className="size-9 p-2 *:data-icon:text-chat-icon hover:*:data-icon:text-chat-icon_hover"
      />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-6 hidden -translate-x-1/2 rounded-lg bg-primary-solid px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover/chat-action:block"
      >
        {tooltip}
      </span>
    </div>
  );
}

function UploadButton({
  "aria-label": ariaLabel,
  icon: Icon,
}: {
  "aria-label": string;
  icon: ButtonIcon;
}) {
  return (
    <Button
      aria-label={ariaLabel}
      color="tertiary"
      iconLeading={Icon}
      noTextPadding
      size="sm"
      className="size-6 shrink-0 overflow-hidden rounded bg-chat-upload p-1 hover:bg-chat-upload data-icon-only:size-6 data-icon-only:p-1 *:data-icon:size-4 *:data-icon:text-chat-upload-icon hover:*:data-icon:text-chat-upload-icon"
    />
  );
}

function getAttachmentIcon(type: ChatAttachment["type"]) {
  if (type === "folder") {
    return Folder;
  }

  if (type === "pdf") {
    return File01;
  }

  return Attachment01;
}

function AttachmentPreview({ attachments }: { attachments: ChatAttachment[] }) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div
      data-slot="attachment-preview"
      className="relative -mb-[22px] h-[62px] w-full shrink-0 overflow-hidden rounded-xl bg-chat-uploader-surface"
    >
      <div className="absolute top-[7px] right-4 flex items-center justify-end gap-2 p-0" dir="ltr">
        {attachments.map((attachment) => {
          const Icon = getAttachmentIcon(attachment.type);
          return <UploadButton aria-label={attachment.name} icon={Icon} key={attachment.id} />;
        })}
      </div>
    </div>
  );
}

function ChatBoxActions({
  isLoading,
  onAttach,
  sendDisabled,
}: {
  isLoading: boolean;
  onAttach: () => void;
  sendDisabled: boolean;
}) {
  const SendIcon = isLoading ? Stop : Send03;

  return (
    <div className="flex shrink-0 items-center justify-end gap-4" dir="ltr">
      <ActionButton
        aria-label={isLoading ? "Stop" : "Send"}
        icon={SendIcon}
        isDisabled={sendDisabled}
        tooltip={isLoading ? "Stop" : "Send"}
      />

      {!isLoading && (
        <div className="flex items-center">
          <ActionButton aria-label="Attach file" icon={Paperclip} onPress={onAttach} tooltip="Attach file" />
          <ActionButton aria-label="AI tools" icon={Stars01} tooltip="AI tools" />
        </div>
      )}
    </div>
  );
}

function ChatTextArea({
  onChange,
  placeholder,
  textareaRef,
  value,
}: {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder: string;
  textareaRef: Ref<HTMLTextAreaElement>;
  value: string;
}) {
  return (
    <TextAreaBase
      aria-label={placeholder}
      dir="rtl"
      ref={textareaRef}
      rows={1}
      size="md"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-[var(--size-chat-textarea-min-height)] max-h-[var(--size-chat-textarea-max-height)] min-w-px flex-1 resize-none overflow-hidden border-0 bg-transparent p-0 text-right text-md font-normal leading-[var(--text-md--line-height)] text-chat-text shadow-none ring-0 [direction:ltr] [unicode-bidi:plaintext] placeholder:text-chat-placeholder focus:ring-0"
    />
  );
}

function useChatBoxValue({
  controlledValue,
  defaultValue,
  onValueChange,
}: {
  controlledValue?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const value = controlledValue ?? uncontrolledValue;

  const handleTextAreaChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value;

      if (typeof controlledValue === "undefined") {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [controlledValue, onValueChange],
  );

  return { handleTextAreaChange, value };
}

function useChatBoxAttachments({
  attachments,
  defaultAttachments,
  onAttachmentsChange,
}: {
  attachments?: ChatAttachment[];
  defaultAttachments?: ChatAttachment[];
  onAttachmentsChange?: (attachments: ChatAttachment[]) => void;
}) {
  const [uncontrolledAttachments, setUncontrolledAttachments] = useState(defaultAttachments ?? []);
  const currentAttachments = attachments ?? uncontrolledAttachments;

  const handleAttachClick = useCallback(() => {
    const nextAttachments = [
      ...currentAttachments,
      { id: crypto.randomUUID(), name: "File attachment", type: "file" as const },
    ];

    if (!attachments) {
      setUncontrolledAttachments(nextAttachments);
    }

    onAttachmentsChange?.(nextAttachments);
  }, [attachments, currentAttachments, onAttachmentsChange]);

  return { currentAttachments, handleAttachClick };
}

function useAutoResizeTextArea({
  isLoading,
  textareaRef,
  value,
}: {
  isLoading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea || isLoading) {
      return;
    }

    const minHeight = readPixelToken("--size-chat-textarea-min-height", 24);
    const maxHeight = readPixelToken("--size-chat-textarea-max-height", 131);
    textarea.style.height = `${minHeight}px`;

    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    if (value.length === 0) {
      textarea.scrollTop = 0;
    }
    setIsExpanded((currentValue) => {
      const nextValue = nextHeight > minHeight;
      return currentValue === nextValue ? currentValue : nextValue;
    });
  }, [isLoading, textareaRef, value]);

  return isExpanded;
}

function useChatBoxContainerState({
  hasAttachments,
  isExpanded,
  isLoading,
}: {
  hasAttachments: boolean;
  isExpanded: boolean;
  isLoading: boolean;
}) {
  return useMemo(() => {
    if (isLoading) {
      return "loading";
    }

    if (hasAttachments) {
      return "attachments";
    }

    if (isExpanded) {
      return "expanded";
    }

    return "default";
  }, [hasAttachments, isExpanded, isLoading]);
}

export function ChatBox({
  attachments,
  className,
  defaultAttachments,
  defaultValue,
  isLoading = false,
  onAttachmentsChange,
  onValueChange,
  placeholder = defaultPlaceholder,
  value: controlledValue,
}: ChatBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { handleTextAreaChange, value } = useChatBoxValue({
    controlledValue,
    defaultValue,
    onValueChange,
  });
  const { currentAttachments, handleAttachClick } = useChatBoxAttachments({
    attachments,
    defaultAttachments,
    onAttachmentsChange,
  });
  const isExpanded = useAutoResizeTextArea({ isLoading, textareaRef, value });
  const hasAttachments = currentAttachments.length > 0;
  const sendDisabled = !value.trim();
  const containerState = useChatBoxContainerState({ hasAttachments, isExpanded, isLoading });

  return (
    <div
      data-state={containerState}
      className={cn(
        "w-full overflow-visible rounded-xl bg-chat-surface border-chat-border backdrop-blur-[47.8px]",
        containerState === "default" && "border-r-[1.5px] border-solid p-5",
        containerState === "loading" && "h-16 bg-transparent",
        containerState === "attachments" && "pt-0",
        className,
      )}
    >
      <AttachmentPreview attachments={currentAttachments} />

      <div
        dir="ltr"
        className={cn(
          "flex w-full items-center justify-between",
          containerState === "loading" && "h-16 rounded-xl bg-chat-surface p-5",
          containerState === "default" && "p-0",
          (containerState === "expanded" || containerState === "attachments") &&
            "items-start gap-10 rounded-xl bg-chat-surface pb-2 pl-5 pr-1 pt-5",
        )}
      >
        <ChatBoxActions isLoading={isLoading} onAttach={handleAttachClick} sendDisabled={sendDisabled} />

        {!isLoading && (
          <ChatTextArea
            onChange={handleTextAreaChange}
            placeholder={placeholder}
            textareaRef={textareaRef}
            value={value}
          />
        )}
      </div>
    </div>
  );
}

ChatBox.displayName = "ChatBox";

"use client";

import { Attachment01, File01, Folder, Paperclip, Send03, Stop } from "@untitledui/icons";
import type { ChangeEvent, ChangeEventHandler, FC, Ref, RefObject } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cx } from "@/utils/cx";
import { Button } from "../../base/button/button";
import { TextAreaBase } from "../../base/textArea/textArea";
import { Tooltip, TooltipTrigger } from "../../base/tooltip/tooltip";
import { LlmSelect } from "../LlmSelect/LlmSelect";

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

const chatTextareaMinHeight = 24;
const chatTextareaMaxHeight = 131;

function ActionButton({
  "aria-label": ariaLabel,
  icon: Icon,
  iconClassName,
  isDisabled,
  onPress,
  tooltip,
}: {
  "aria-label": string;
  icon: ButtonIcon;
  iconClassName?: string;
  isDisabled?: boolean;
  onPress?: () => void;
  tooltip: string;
}) {
  return (
    <Tooltip title={tooltip} placement="top" isDisabled={isDisabled}>
      <TooltipTrigger
        aria-label={ariaLabel}
        isDisabled={isDisabled}
        onPress={onPress}
        className="group relative inline-flex size-9 cursor-pointer items-center justify-center gap-1 rounded-lg p-2 outline-focus-ring transition duration-100 ease-linear hover:text-blue-700 focus:ring-0 focus:shadow-none focus-visible:shadow-none disabled:cursor-not-allowed disabled:text-neutral-300 *:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:text-featured-icon-light-fg-gray *:data-icon:transition-inherit-all hover:*:data-icon:text-fg-quaternary_hover disabled:*:data-icon:text-neutral-300"
      >
        <Icon
          className={cx(
            "pointer-events-none size-5 shrink-0 transition-inherit-all",
            iconClassName,
          )}
          data-icon="leading"
        />
      </TooltipTrigger>
    </Tooltip>
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
      className="size-6 shrink-0 overflow-hidden rounded bg-neutral-100 p-1 hover:bg-neutral-100 data-icon-only:size-6 data-icon-only:p-1 *:data-icon:size-4 *:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary"
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
      className="relative w-full overflow-hidden rounded-xl bg-primary py-2 px-4"
    >
      <div className="flex items-center justify-end gap-2 p-0 bg-primary" dir="ltr">
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
    <div
      className={cx("flex shrink-0 items-center justify-end gap-4", !isLoading && "mb-auto")}
      dir="ltr"
    >
      <ActionButton
        aria-label={isLoading ? "Stop" : "Send"}
        icon={SendIcon}
        iconClassName={isLoading ? undefined : "rotate-180"}
        isDisabled={sendDisabled}
        tooltip={isLoading ? "Stop" : "Send"}
      />

      {!isLoading && (
        <div className="flex items-center">
          <ActionButton
            aria-label="Attach file"
            icon={Paperclip}
            onPress={onAttach}
            tooltip="Attach file"
          />
          <LlmSelect trigger="icon" className="w-auto" />
        </div>
      )}
    </div>
  );
}

function ChatTextArea({
  isExpanded,
  onChange,
  placeholder,
  textareaRef,
  value,
}: {
  isExpanded: boolean;
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
      className={cx(
        "h-[var(--size-chat-textarea-min-height)] max-h-[var(--size-chat-textarea-max-height)] min-w-px flex-1 resize-none overflow-hidden border-0 bg-transparent p-0 text-right text-md font-normal leading-6 text-secondary shadow-none ring-0 [direction:ltr] [unicode-bidi:plaintext] placeholder:text-placeholder focus:ring-0",
        isExpanded && "scrollbar-chatbox pr-3 [scrollbar-gutter:stable]",
      )}
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

    const minHeight = chatTextareaMinHeight;
    const maxHeight = chatTextareaMaxHeight;
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
    <div className="flex w-full flex-col bg-primary rounded-xl">
      <AttachmentPreview attachments={currentAttachments} />
      <div
        data-state={containerState}
        className={cx(
          "w-full overflow-visible p-5 rounded-xl border-brand-100 bg-primary_hover backdrop-blur-[47.8px] dark:border-black dark:bg-surface-primary",
          containerState === "default" && "border-r-[1.5px] border-solid",
          containerState === "loading" && "h-16 p-0 bg-transparent",
          className,
        )}
      >
        <div
          dir="ltr"
          className={cx(
            "flex w-full items-center justify-between gap-1.5",
            containerState === "loading" &&
              "h-full w-full rounded-xl bg-primary_hover p-5 dark:bg-surface-primary",
            containerState === "default" && "p-0",
            (containerState === "expanded" || containerState === "attachments") && "p-0",
          )}
        >
          <ChatBoxActions
            isLoading={isLoading}
            onAttach={handleAttachClick}
            sendDisabled={sendDisabled}
          />

          {!isLoading && (
            <ChatTextArea
              isExpanded={isExpanded}
              onChange={handleTextAreaChange}
              placeholder={placeholder}
              textareaRef={textareaRef}
              value={value}
            />
          )}
        </div>
      </div>
    </div>
  );
}

ChatBox.displayName = "ChatBox";

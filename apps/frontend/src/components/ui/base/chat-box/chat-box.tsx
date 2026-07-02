"use client";

import { FileAttachment01, Folder, MagicWand01, Paperclip, Send03, Stop } from "@untitledui/icons";
import type { ChangeEventHandler, ReactNode } from "react";
import { useState } from "react";
import { cx } from "@/lib/cn";
import { Tooltip, TooltipTrigger } from "../tooltip/tooltip";
import { TextAreaBase } from "../textarea/textarea";

export type ChatBoxTheme = "light" | "dark";
export type ChatBoxVariant =
  | "default"
  | "edge-1"
  | "edge-2"
  | "edge-3"
  | "edge-4"
  | "edge-5"
  | "edge-6"
  | "edge-7"
  | "uploader"
  | "long"
  | "loading";

type BorderEdge = "right" | "top" | "left" | "bottom" | "none";

type TextValueProps = {
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
};

export interface ChatBoxProps extends TextValueProps {
  theme?: ChatBoxTheme;
  variant?: ChatBoxVariant;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

const DEFAULT_PLACEHOLDER = "\u0627\u0632 chat gpt 3/5 \u0628\u067e\u0631\u0633\u06cc\u062f";
const LONG_TEXT =
  "\u0644\u0648\u0631\u0645 \u0627\u06cc\u067e\u0633\u0648\u0645 \u0645\u062a\u0646 \u0633\u0627\u062e\u062a\u06af\u06cc \u0628\u0627 \u062a\u0648\u0644\u06cc\u062f \u0633\u0627\u062f\u06af\u06cc \u0646\u0627\u0645\u0641\u0647\u0648\u0645 \u0627\u0632 \u0635\u0646\u0639\u062a \u0686\u0627\u067e \u0648 \u0628\u0627 \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0627\u0632 \u0637\u0631\u0627\u062d\u0627\u0646 \u06af\u0631\u0627\u0641\u06cc\u06a9 \u0627\u0633\u062a. \u0686\u0627\u067e\u06af\u0631\u0647\u0627 \u0648 \u0645\u062a\u0648\u0646 \u0628\u0644\u06a9\u0647 \u0631\u0648\u0632\u0646\u0627\u0645\u0647 \u0648 \u0645\u062c\u0644\u0647 \u062f\u0631 \u0633\u062a\u0648\u0646 \u0648 \u0633\u0637\u0631\u0622\u0646\u0686\u0646\u0627\u0646 \u06a9\u0647 \u0644\u0627\u0632\u0645 \u0627\u0633\u062a \u0648 \u0628\u0631\u0627\u06cc \u0634\u0631\u0627\u06cc\u0637 \u0641\u0639\u0644\u06cc \u062a\u06a9\u0646\u0648\u0644\u0648\u0698\u06cc \u0645\u0648\u0631\u062f \u0646\u06cc\u0627\u0632 \u0648 \u06a9\u0627\u0631\u0628\u0631\u062f\u0647\u0627\u06cc \u0645\u062a\u0646\u0648\u0639 \u0628\u0627 \u0647\u062f\u0641 \u0628\u0647\u0628\u0648\u062f \u0627\u0628\u0632\u0627\u0631\u0647\u0627\u06cc \u06a9\u0627\u0631\u0628\u0631\u062f\u06cc \u0645\u06cc \u0628\u0627\u0634\u062f. \u06a9\u062a\u0627\u0628\u0647\u0627\u06cc \u0632\u06cc\u0627\u062f\u06cc \u062f\u0631 \u0634\u0635\u062a \u0648 \u0633\u0647 \u062f\u0631\u0635\u062f \u06af\u0630\u0634\u062a\u0647\u060c \u062d\u0627\u0644 \u0648 \u0622\u06cc\u0646\u062f\u0647 \u0634\u0646\u0627\u062e\u062a \u0641\u0631\u0627\u0648\u0627\u0646 \u062c\u0627\u0645\u0639\u0647 \u0648 \u0645\u062a\u062e\u0635\u0635\u0627\u0646 \u0631\u0627 \u0645\u06cc \u0637\u0644\u0628\u062f \u062a\u0627 \u0628\u0627 \u0646\u0631\u0645 \u0627\u0641\u0632\u0627\u0631\u0647\u0627 \u0634\u0646\u0627\u062e\u062a \u0628\u06cc\u0634\u062a\u0631\u06cc \u0631\u0627 \u0628\u0631\u0627\u06cc \u0637\u0631\u0627\u062d\u0627\u0646 \u0631\u0627\u06cc\u0627\u0646\u0647 \u0627\u06cc \u0639\u0644\u06cc \u0627\u0644\u062e\u0635\u0648\u0635 \u0637\u0631\u0627\u062d\u0627\u0646 \u062e\u0644\u0627\u0642\u06cc \u0648 \u0641\u0631\u0647\u0646\u06af \u067e\u06cc\u0634\u0631\u0648 \u062f\u0631 \u0632\u0628\u0627\u0646 \u0641\u0627\u0631\u0633\u06cc \u0627\u06cc\u062c\u0627\u062f \u06a9\u0631\u062f. \u062f\u0631 \u0627\u06cc\u0646 \u0635\u0648\u0631\u062a \u0645\u06cc \u062a\u0648\u0627\u0646 \u0627\u0645\u06cc\u062f \u062f\u0627\u0634\u062a \u06a9\u0647 \u062a\u0645\u0627\u0645 \u0648 \u062f\u0634\u0648\u0627\u0631\u06cc \u0645\u0648\u062c\u0648\u062f \u062f\u0631 \u0627\u0631\u0627\u0626\u0647 \u0631\u0627\u0647\u06a9\u0627\u0631\u0647\u0627 \u0648 \u0634\u0631\u0627\u06cc\u0637 \u0633\u062e\u062a \u062a\u0627\u06cc\u067e \u0628\u0647 \u067e\u0627\u06cc\u0627\u0646 \u0631\u0633\u062f \u0648 \u0632\u0645\u0627\u0646 \u0645\u0648\u0631\u062f \u0646\u06cc\u0627\u0632 \u0634\u0627\u0645\u0644 \u062d\u0631\u0648\u0641\u0686\u06cc\u0646\u06cc \u062f\u0633\u062a\u0627\u0648\u0631\u062f\u0647\u0627\u06cc \u0627\u0635\u0644\u06cc \u0648 \u062c\u0648\u0627\u0628\u06af\u0648\u06cc \u0633\u0648\u0627\u0644\u0627\u062a \u067e\u06cc\u0648\u0633\u062a\u0647 \u0627\u0647\u0644 \u062f\u0646\u06cc\u0627\u06cc \u0645\u0648\u062c\u0648\u062f \u0637\u0631\u0627\u062d\u06cc \u0627\u0633\u0627\u0633\u0627 \u0645\u0648\u0631\u062f \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0642\u0631\u0627\u0631 \u06af\u06cc\u0631\u062f.";

const variantEdge: Record<ChatBoxVariant, BorderEdge> = {
  default: "right",
  "edge-1": "right",
  "edge-2": "top",
  "edge-3": "top",
  "edge-4": "top",
  "edge-5": "left",
  "edge-6": "bottom",
  "edge-7": "bottom",
  uploader: "none",
  long: "none",
  loading: "none",
};

const borderClassName: Record<BorderEdge, string> = {
  right: "border-r-[1.5px]",
  top: "border-t-[1.5px]",
  left: "border-l-[1.5px]",
  bottom: "border-b-[1.5px]",
  none: "border-0",
};

function isLongVariant(variant: ChatBoxVariant) {
  return variant === "long";
}

function isUploaderVariant(variant: ChatBoxVariant) {
  return variant === "uploader";
}

function isLoadingVariant(variant: ChatBoxVariant) {
  return variant === "loading";
}

function getSurfaceClassName(theme: ChatBoxTheme) {
  if (theme === "dark") {
    return "bg-(--chatbox-bg-dark) border-(--chatbox-border-dark)";
  }

  return "bg-(--chatbox-bg-light) border-(--chatbox-border-light)";
}

function getIconClassName(theme: ChatBoxTheme) {
  if (theme === "dark") {
    return "text-(--chatbox-icon-dark) hover:text-(--chatbox-icon-light)";
  }

  return "text-(--chatbox-icon-light) hover:text-(--chatbox-icon-hover-light)";
}

function getInitialTextValue(
  defaultValue: string | undefined,
  fallbackDefaultValue: string | undefined,
) {
  if (typeof defaultValue !== "undefined") {
    return defaultValue;
  }

  if (fallbackDefaultValue) {
    return fallbackDefaultValue;
  }

  return "";
}

function IconButton({
  children,
  label,
  className,
  isDisabled,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  isDisabled?: boolean;
}) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const openTooltip = () => {
    if (!isDisabled) {
      setIsTooltipOpen(true);
    }
  };
  const closeTooltip = () => setIsTooltipOpen(false);

  return (
    <Tooltip
      title={label}
      placement="top"
      delay={0}
      isDisabled={isDisabled}
      isOpen={!isDisabled && isTooltipOpen}
    >
      <TooltipTrigger
        aria-label={label}
        isDisabled={isDisabled}
        onBlur={closeTooltip}
        onFocus={openTooltip}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        className={cx(
          "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm outline-hidden transition duration-100 hover:bg-(--chatbox-icon-bg-hover) focus-visible:shadow-(--button-focus-ring-secondary)",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent data-disabled:cursor-not-allowed data-disabled:opacity-40 data-disabled:hover:bg-transparent",
          className,
        )}
      >
        {children}
      </TooltipTrigger>
    </Tooltip>
  );
}

function ChatControls({
  theme,
  loading,
  canSend,
}: {
  theme: ChatBoxTheme;
  loading: boolean;
  canSend: boolean;
}) {
  const sendAndAttachmentSize = "size-6";
  const magicSize = "size-5";
  const iconClassName = getIconClassName(theme);

  if (loading) {
    return (
      <div className="flex items-center justify-end" dir="ltr">
        <IconButton label="Stop" className={iconClassName}>
          <Stop className="size-6" />
        </IconButton>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-6" dir="ltr" data-chatbox-actions="true">
      <IconButton label="Send" className={iconClassName} isDisabled={!canSend}>
        <Send03 className={cx(sendAndAttachmentSize, "rotate-180")} />
      </IconButton>
      <div className="flex items-center gap-4">
        <IconButton label="Attach file" className={iconClassName}>
          <Paperclip className={cx(sendAndAttachmentSize, "rotate-90")} />
        </IconButton>
        <IconButton label="AI tools" className={iconClassName}>
          <MagicWand01 className={magicSize} />
        </IconButton>
      </div>
    </div>
  );
}

function AttachmentButton({ children, label }: { children: ReactNode; label: string }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const openTooltip = () => setIsTooltipOpen(true);
  const closeTooltip = () => setIsTooltipOpen(false);

  return (
    <Tooltip title={label} placement="top" delay={0} isOpen={isTooltipOpen}>
      <TooltipTrigger
        aria-label={label}
        onBlur={closeTooltip}
        onFocus={openTooltip}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        className="flex items-center rounded-xs bg-(--chatbox-attachment-chip-bg) p-1 text-(--chatbox-attachment-icon) transition duration-100 hover:bg-(--chatbox-attachment-chip-bg-hover) focus-visible:shadow-(--button-focus-ring-secondary)"
      >
        {children}
      </TooltipTrigger>
    </Tooltip>
  );
}

function AttachmentButtons() {
  return (
    <div className="absolute top-[7px] right-4 flex items-center justify-end gap-2">
      <AttachmentButton label="Open folder">
        <Folder className="size-4" />
      </AttachmentButton>
      <AttachmentButton label="PDF attachment">
        <FileAttachment01 className="size-4" />
      </AttachmentButton>
      <AttachmentButton label="File attachment">
        <FileAttachment01 className="size-4" />
      </AttachmentButton>
    </div>
  );
}

function EditableChatTextArea({
  placeholder,
  value,
  onChange,
  className,
  label,
  scrollsOnRight,
}: {
  placeholder?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  className?: string;
  label: string;
  scrollsOnRight?: boolean;
}) {
  return (
    <TextAreaBase
      aria-label={label}
      dir={scrollsOnRight ? "ltr" : "rtl"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cx(
        "resize-none border-0 bg-transparent p-0 text-right font-normal shadow-none ring-0 outline-hidden placeholder:text-(--chatbox-placeholder) focus:ring-0",
        scrollsOnRight && "[unicode-bidi:plaintext]",
        className,
      )}
    />
  );
}

export function ChatBox({
  theme = "light",
  variant = "default",
  placeholder = DEFAULT_PLACEHOLDER,
  value,
  defaultValue,
  onChange,
  className,
  "data-testid": dataTestId,
}: ChatBoxProps) {
  const long = isLongVariant(variant);
  const uploader = isUploaderVariant(variant);
  const loading = isLoadingVariant(variant);
  const edge = variantEdge[variant];
  const fallbackDefaultValue = long ? LONG_TEXT : undefined;
  const [internalValue, setInternalValue] = useState(() =>
    getInitialTextValue(defaultValue, fallbackDefaultValue),
  );
  const textValue = value ?? internalValue;
  const canSend = textValue.trim().length > 0;
  const baseSurfaceClassName = cx(
    "relative h-auto w-full overflow-hidden rounded-xl border-solid backdrop-blur-(--chatbox-backdrop-blur)",
    getSurfaceClassName(theme),
    borderClassName[edge],
    className,
  );
  const handleTextAreaChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setInternalValue(event.target.value);
    onChange?.(event);
  };

  if (uploader) {
    return (
      <div className={cx("flex w-full flex-col", className)} data-testid={dataTestId} dir="rtl">
        <div className="relative mb-[-22px] h-[62px] w-full shrink-0 overflow-hidden rounded-xl bg-(--chatbox-attachment-bg)">
          <AttachmentButtons />
        </div>
        <div className="relative flex h-16 w-full shrink-0 items-center justify-between rounded-xl bg-(--chatbox-bg-light) p-(--chatbox-padding-desktop)">
          <EditableChatTextArea
            label={placeholder}
            placeholder={placeholder}
            value={textValue}
            onChange={handleTextAreaChange}
            className="h-6 min-w-px flex-1 text-md leading-6 text-(--chatbox-placeholder)"
          />
          <ChatControls theme="light" loading={false} canSend={canSend} />
        </div>
      </div>
    );
  }

  if (long) {
    return (
      <div className={baseSurfaceClassName} data-testid={dataTestId} dir="rtl">
        <div className="flex w-full min-w-px items-start justify-between gap-10 rounded-xl bg-(--chatbox-bg-light) pt-5 pr-1 pb-2 pl-5">
          <EditableChatTextArea
            label="Chat message"
            value={textValue}
            onChange={handleTextAreaChange}
            scrollsOnRight
            className="h-[131px] min-w-px flex-1 overflow-y-auto overflow-x-hidden text-md leading-6 text-(--chatbox-text) [scrollbar-gutter:stable]"
          />
          <ChatControls theme="light" loading={false} canSend={canSend} />
        </div>
      </div>
    );
  }

  return (
    <div className={baseSurfaceClassName} data-testid={dataTestId} dir="rtl">
      <div className={cx("flex w-full items-center justify-between", loading ? "h-16 p-5" : "p-5")}>
        {!loading && (
          <EditableChatTextArea
            label={placeholder}
            placeholder={placeholder}
            value={textValue}
            onChange={handleTextAreaChange}
            className="h-6 min-w-px flex-1 overflow-hidden text-md leading-6 text-(--chatbox-placeholder)"
          />
        )}
        <ChatControls theme={theme} loading={loading} canSend={canSend} />
      </div>
    </div>
  );
}

ChatBox.displayName = "ChatBox";

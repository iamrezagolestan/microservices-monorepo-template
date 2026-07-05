"use client";

import type { ReactNode, Ref } from "react";
import { useCallback } from "react";
import type {
  TextAreaProps as AriaTextAreaProps,
  TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import { TextArea as AriaTextArea, TextField as AriaTextField } from "react-aria-components";
import { cx } from "@/utils/cx";
import { HintText } from "../input/hintText";
import { Label } from "../input/label";

export type TextAreaBaseProps = AriaTextAreaProps & {
  ref?: Ref<HTMLTextAreaElement>;
  size?: "sm" | "md";
};

type TextAreaClassName = Exclude<AriaTextAreaProps["className"], string | undefined>;
type TextFieldClassName = Exclude<AriaTextFieldProps["className"], string | undefined>;

export function TextAreaBase({ className, size = "md", ...props }: TextAreaBaseProps) {
  const renderClassName = useCallback<TextAreaClassName>(
    (state) =>
      cx(
        "w-full scroll-py-3 resize-none rounded-lg bg-input-surface text-input-value shadow-xs ring-1 ring-input-border transition duration-100 ease-linear ring-inset placeholder:text-input-placeholder autofill:rounded-lg autofill:text-input-value focus:outline-hidden",
        size === "sm" && "p-3 text-sm leading-[var(--text-sm--line-height)]",
        size === "md" && "px-3.5 py-3 text-md leading-[var(--text-md--line-height)]",
        state.isFocused && !state.isDisabled && "ring-2 ring-input-focus",
        state.isDisabled && "cursor-not-allowed opacity-50",
        state.isInvalid && "ring-error_subtle",
        state.isInvalid && state.isFocused && "ring-2 ring-error",
        typeof className === "function" ? className(state) : className,
      ),
    [className, size],
  );

  return (
    <AriaTextArea
      {...props}
      className={renderClassName}
    />
  );
}

TextAreaBase.displayName = "TextAreaBase";

export type TextAreaProps = AriaTextFieldProps & {
  className?: AriaTextFieldProps["className"];
  cols?: number;
  hideRequiredIndicator?: boolean;
  hint?: ReactNode;
  label?: string;
  placeholder?: string;
  ref?: Ref<HTMLDivElement>;
  rows?: number;
  size?: TextAreaBaseProps["size"];
  textAreaClassName?: TextAreaBaseProps["className"];
  textAreaRef?: TextAreaBaseProps["ref"];
  tooltip?: string;
};

export function TextArea({
  className,
  cols,
  hideRequiredIndicator,
  hint,
  label,
  placeholder,
  rows,
  size = "md",
  textAreaClassName,
  textAreaRef,
  tooltip,
  ...props
}: TextAreaProps) {
  const renderClassName = useCallback<TextFieldClassName>(
    (state) =>
      cx(
        "group flex h-max w-full flex-col items-start justify-start gap-1.5",
        typeof className === "function" ? className(state) : className,
      ),
    [className],
  );

  return (
    <AriaTextField
      {...props}
      data-input-size={size}
      className={renderClassName}
    >
      {({ isInvalid, isRequired }) => (
        <>
          {Boolean(label) && (
            <Label isRequired={hideRequiredIndicator ? false : isRequired} tooltip={tooltip}>
              {label}
            </Label>
          )}

          <TextAreaBase
            cols={cols}
            placeholder={placeholder}
            ref={textAreaRef}
            rows={rows}
            size={size}
            className={textAreaClassName}
          />

          {Boolean(hint) && (
            <HintText isInvalid={isInvalid} size={size}>
              {hint}
            </HintText>
          )}
        </>
      )}
    </AriaTextField>
  );
}

TextArea.displayName = "TextArea";

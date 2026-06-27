"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import type {
  TextAreaProps as AriaTextAreaProps,
  TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import { TextArea as AriaTextArea, TextField as AriaTextField } from "react-aria-components";
import { cx } from "@/lib/cn";
import { HintText } from "../input/hint-text";
import { Label } from "../input/label";

interface TextAreaBaseProps extends AriaTextAreaProps {
  ref?: Ref<HTMLTextAreaElement>;
  size?: "sm" | "md";
}

export const TextAreaBase = ({ className, size = "md", ...props }: TextAreaBaseProps) => {
  return (
    <AriaTextArea
      {...props}
      style={
        {
          "--resize-handle-bg": "var(--textarea-resize-handle-bg)",
          "--resize-handle-bg-dark": "var(--textarea-resize-handle-bg-dark)",
        } as CSSProperties
      }
      className={(state) =>
        cx(
          "w-full scroll-py-3 rounded-lg bg-(--textarea-bg) text-(--textarea-fg) shadow-(--shadow-xs) ring-1 ring-(--textarea-border) transition duration-100 ease-linear ring-inset placeholder:text-(--textarea-placeholder) autofill:rounded-lg autofill:text-(--textarea-fg) focus:outline-hidden",
          size === "sm" && "p-3 text-sm leading-5",
          size === "md" && "px-3.5 py-3 text-md leading-6",
          "[&::-webkit-resizer]:bg-(image:--resize-handle-bg) [&::-webkit-resizer]:bg-contain dark:[&::-webkit-resizer]:bg-(image:--resize-handle-bg-dark)",
          state.isFocused && !state.isDisabled && "ring-2 ring-(--textarea-border-focus)",
          state.isDisabled && "cursor-not-allowed opacity-50",
          state.isInvalid && "ring-red-600",
          state.isInvalid && state.isFocused && "ring-2 ring-red-700",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
};

TextAreaBase.displayName = "TextAreaBase";

interface TextFieldProps extends AriaTextFieldProps {
  label?: string;
  hint?: ReactNode;
  tooltip?: string;
  size?: TextAreaBaseProps["size"];
  textAreaClassName?: TextAreaBaseProps["className"];
  ref?: Ref<HTMLDivElement>;
  textAreaRef?: TextAreaBaseProps["ref"];
  hideRequiredIndicator?: boolean;
  placeholder?: string;
  rows?: number;
  cols?: number;
}

export const TextArea = ({
  label,
  hint,
  tooltip,
  textAreaRef,
  hideRequiredIndicator,
  textAreaClassName,
  placeholder,
  className,
  rows,
  cols,
  size = "md",
  ...props
}: TextFieldProps) => {
  return (
    <AriaTextField
      {...props}
      className={(state) =>
        cx(
          "group flex h-max w-full flex-col items-start justify-start gap-1.5",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ isInvalid, isRequired }) => (
        <>
          {label && (
            <Label isRequired={hideRequiredIndicator ? !hideRequiredIndicator : isRequired} tooltip={tooltip}>
              {label}
            </Label>
          )}

          <TextAreaBase
            ref={textAreaRef}
            placeholder={placeholder}
            className={textAreaClassName}
            rows={rows}
            cols={cols}
            size={size}
          />

          {hint && (
            <HintText isInvalid={isInvalid} size={size}>
              {hint}
            </HintText>
          )}
        </>
      )}
    </AriaTextField>
  );
};

TextArea.displayName = "TextArea";

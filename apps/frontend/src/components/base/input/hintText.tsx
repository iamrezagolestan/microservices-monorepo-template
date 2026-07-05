"use client";

import type { ReactNode, Ref } from "react";
import type { TextProps as AriaTextProps } from "react-aria-components";
import { Text as AriaText } from "react-aria-components";
import { cx } from "@/utils/cx";

type HintTextProps = AriaTextProps & {
  children: ReactNode;
  isInvalid?: boolean;
  ref?: Ref<HTMLElement>;
  size?: "sm" | "md";
};

export function HintText({ isInvalid, className, size = "md", ...props }: HintTextProps) {
  return (
    <AriaText
      {...props}
      slot={isInvalid ? "errorMessage" : "description"}
      className={cx(
        "text-sm text-quaternary",
        size === "sm" && "text-xs",
        "in-data-[input-size=sm]:text-xs",
        isInvalid && "text-error-primary",
        "group-invalid:text-error-primary",
        className,
      )}
    />
  );
}

HintText.displayName = "HintText";

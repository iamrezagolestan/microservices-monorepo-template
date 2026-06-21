"use client";

import type { ReactNode, Ref } from "react";
import type { TextProps as AriaTextProps } from "react-aria-components";
import { Text as AriaText } from "react-aria-components";
import { cx } from "@/lib/cn";

interface HintTextProps extends AriaTextProps {
  /** Indicates that the hint text is an error message. */
  isInvalid?: boolean;
  ref?: Ref<HTMLElement>;
  size?: "sm" | "md";
  children: ReactNode;
}

export const HintText = ({ isInvalid, className, size = "md", ...props }: HintTextProps) => {
  return (
    <AriaText
      {...props}
      slot={isInvalid ? "errorMessage" : "description"}
      className={cx(
        "text-sm leading-5 text-(--input-helper-fg)",

        // Size
        size === "sm" && "text-xs",
        "in-data-[input-size=sm]:text-xs",

        // Invalid state
        isInvalid && "text-red-700",
        "group-invalid:text-red-700",

        className,
      )}
    />
  );
};

HintText.displayName = "HintText";

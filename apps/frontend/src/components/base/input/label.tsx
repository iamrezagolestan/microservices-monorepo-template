"use client";

import { HelpCircle } from "@untitledui/icons";
import type { ReactNode, Ref } from "react";
import type { LabelProps as AriaLabelProps } from "react-aria-components";
import { Label as AriaLabel } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Tooltip, TooltipTrigger } from "../tooltip/tooltip";

type LabelProps = AriaLabelProps & {
  children: ReactNode;
  indicatorPosition?: "leading" | "trailing";
  isInvalid?: boolean;
  isRequired?: boolean;
  ref?: Ref<HTMLLabelElement>;
  tooltip?: string;
  tooltipDescription?: string;
};

export function Label({
  children,
  className,
  indicatorPosition = "trailing",
  isInvalid,
  isRequired,
  tooltip,
  tooltipDescription,
  ...props
}: LabelProps) {
  const requiredIndicator = (
    <span
      className={cx(
        "hidden text-red-700",
        isRequired && "block",
        typeof isRequired === "undefined" && "group-required:block",
        isInvalid && "text-error-primary",
        typeof isInvalid === "undefined" && "group-invalid:text-error-primary",
      )}
    >
      *
    </span>
  );

  return (
    <AriaLabel
      data-label="true"
      {...props}
      className={cx(
        "flex cursor-default items-center gap-0.5 text-sm font-medium text-secondary",
        className,
      )}
    >
      {indicatorPosition === "leading" && requiredIndicator}
      {children}
      {indicatorPosition === "trailing" && requiredIndicator}

      {tooltip && (
        <Tooltip title={tooltip} description={tooltipDescription} placement="top">
          <TooltipTrigger
            className="cursor-pointer text-fg-quaternary transition duration-200 hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover"
            isDisabled={false}
          >
            <HelpCircle className="size-4" />
          </TooltipTrigger>
        </Tooltip>
      )}
    </AriaLabel>
  );
}

Label.displayName = "Label";

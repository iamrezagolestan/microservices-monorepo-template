"use client";

import { HelpCircle } from "@untitledui/icons";
import type { ReactNode, Ref } from "react";
import type { LabelProps as AriaLabelProps } from "react-aria-components";
import { Label as AriaLabel } from "react-aria-components";
import { cx } from "@/lib/cn";
import { Tooltip, TooltipTrigger } from "../tooltip/tooltip";

interface LabelProps extends AriaLabelProps {
  children: ReactNode;
  isInvalid?: boolean;
  isRequired?: boolean;
  tooltip?: string;
  tooltipDescription?: string;
  ref?: Ref<HTMLLabelElement>;
}

export const Label = ({
  isInvalid,
  isRequired,
  tooltip,
  tooltipDescription,
  className,
  ...props
}: LabelProps) => {
  return (
    <AriaLabel
      // Used for conditionally hiding/showing the label element via CSS:
      // <Input label="Visible only on mobile" className="lg:**:data-label:hidden" />
      // or
      // <Input label="Visible only on mobile" className="lg:label:hidden" />
      data-label="true"
      {...props}
      className={cx(
        "flex w-full cursor-default items-center justify-end gap-0.5 text-right text-sm leading-5 font-medium text-(--input-label-fg)",
        className,
      )}
    >
      {props.children}

      <span
        className={cx(
          "hidden text-(--input-required-fg) leading-[6px]",
          isRequired && "block",
          typeof isRequired === "undefined" && "group-required:block",

          isInvalid && "text-red-700",
          typeof isInvalid === "undefined" && "group-invalid:text-red-700",
        )}
      >
        *
      </span>

      {tooltip && (
        <Tooltip title={tooltip} description={tooltipDescription} placement="top">
          <TooltipTrigger
            // `TooltipTrigger` inherits the disabled state from the parent form field
            // but we don't that. We want the tooltip be enabled even if the parent
            // field is disabled.
            isDisabled={false}
            className="cursor-pointer text-(--input-icon-fg) transition duration-200 hover:text-gray-50 focus:text-gray-50"
          >
            <HelpCircle className="size-4" />
          </TooltipTrigger>
        </Tooltip>
      )}
    </AriaLabel>
  );
};

Label.displayName = "Label";

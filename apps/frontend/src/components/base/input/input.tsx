"use client";

import { Eye, EyeOff, HelpCircle, InfoCircle } from "@untitledui/icons";
import type { ComponentType, HTMLAttributes, ReactNode, Ref } from "react";
import { createContext, useContext, useState } from "react";
import type {
  InputProps as AriaInputProps,
  TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import {
  Button as AriaButton,
  Group as AriaGroup,
  Input as AriaInput,
  TextField as AriaTextField,
} from "react-aria-components";
import { cx } from "@/utils/cx";
import { HintText } from "./hintText";
import { Label } from "./label";
import { Tooltip, TooltipTrigger } from "../tooltip/tooltip";

type IconPosition = "leading" | "trailing";
type RequiredIndicatorPosition = "leading" | "trailing";

export type InputBaseProps = Omit<AriaInputProps, "size"> & {
  groupRef?: Ref<HTMLDivElement>;
  icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement>>;
  iconClassName?: string;
  iconPosition?: IconPosition;
  inputClassName?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
  shortcut?: boolean | string;
  size?: "sm" | "md" | "lg";
  tooltip?: string;
  tooltipClassName?: string;
  tooltipPosition?: IconPosition;
  wrapperClassName?: string;
};

const inputSizes = {
  sm: {
    root: "px-3 py-2 text-sm",
    leadingIcon: "left-3 size-4 stroke-[2.25px]",
    shortcut: "pr-1.5",
    trailingIcon: "right-3 size-4 stroke-[2.25px]",
  },
  md: {
    root: "px-3 py-2 text-md",
    leadingIcon: "left-3 size-5",
    shortcut: "pr-2",
    trailingIcon: "right-3 size-5",
  },
  lg: {
    root: "px-3.5 py-2.5 text-md",
    leadingIcon: "left-3.5 size-5",
    shortcut: "pr-2.5",
    trailingIcon: "right-3.5 size-5",
  },
} as const;

function iconPadding(
  size: InputBaseProps["size"],
  hasLeadingIcon: boolean,
  hasTrailingIcon: boolean,
) {
  const inputSize = size ?? "md";

  if (inputSize === "sm") {
    return cx(hasLeadingIcon && "pl-9", hasTrailingIcon && "pr-9");
  }

  if (inputSize === "lg") {
    return cx(hasLeadingIcon && "pl-10.5", hasTrailingIcon && "pr-9.5");
  }

  return cx(hasLeadingIcon && "pl-10", hasTrailingIcon && "pr-9");
}

export function InputBase({
  ref,
  groupRef,
  icon: Icon,
  iconClassName,
  iconPosition = "leading",
  inputClassName,
  isDisabled,
  isInvalid,
  isRequired,
  placeholder,
  shortcut,
  size = "md",
  tooltip,
  tooltipClassName,
  tooltipPosition = "trailing",
  type = "text",
  wrapperClassName,
  ...inputProps
}: InputBaseProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const context = useContext(TextFieldContext);
  const inputSize = context.size ?? size;
  const hasIcon = Boolean(Icon);
  const hasTooltipIcon = Boolean(tooltip) || Boolean(isInvalid);
  const hasLeadingIcon =
    (hasIcon && iconPosition === "leading") || (hasTooltipIcon && tooltipPosition === "leading");
  const hasTrailingIcon =
    (hasIcon && iconPosition === "trailing") || (hasTooltipIcon && tooltipPosition === "trailing");

  return (
    <AriaGroup
      {...{ isDisabled, isInvalid }}
      ref={groupRef}
      className={({ isDisabled, isFocusWithin, isInvalid }) =>
        cx(
          "group/input relative flex w-full flex-row place-content-center place-items-center rounded-lg bg-input-surface shadow-xs ring-1 ring-input-border transition-shadow duration-100 ease-linear ring-inset",
          isFocusWithin && !isDisabled && "ring-2 ring-input-focus",
          isDisabled && "cursor-not-allowed",
          "group-disabled:cursor-not-allowed",
          isInvalid && "ring-error_subtle",
          "group-invalid:ring-error_subtle",
          isInvalid && isFocusWithin && "ring-2 ring-error",
          isFocusWithin && "group-invalid:ring-2 group-invalid:ring-error",
          context.wrapperClassName,
          wrapperClassName,
        )
      }
    >
      {Icon && (
        <Icon
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute text-input-icon",
            iconPosition === "leading"
              ? inputSizes[inputSize].leadingIcon
              : inputSizes[inputSize].trailingIcon,
            context.iconClassName,
            iconClassName,
          )}
        />
      )}

      <AriaInput
        {...(inputProps as AriaInputProps)}
        ref={ref}
        disabled={isDisabled}
        placeholder={placeholder}
        required={isRequired}
        type={type === "password" && isPasswordVisible ? "text" : type}
        className={cx(
          "m-0 w-full bg-transparent text-input-value ring-0 outline-hidden placeholder:text-input-placeholder autofill:rounded-lg autofill:text-input-value disabled:cursor-not-allowed disabled:text-input-disabled",
          inputSizes[inputSize].root,
          iconPadding(inputSize, hasLeadingIcon, hasTrailingIcon),
          context.inputClassName,
          inputClassName,
        )}
      />

      {tooltip && type !== "password" && (
        <Tooltip title={tooltip} placement="top">
          <TooltipTrigger
            className={cx(
              "absolute cursor-pointer text-input-icon transition duration-100 ease-linear group-invalid/input:hidden hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover",
              tooltipPosition === "leading"
                ? inputSizes[inputSize].leadingIcon
                : inputSizes[inputSize].trailingIcon,
              context.tooltipClassName,
              tooltipClassName,
            )}
          >
            <HelpCircle className="size-4 stroke-[2.25px]" />
          </TooltipTrigger>
        </Tooltip>
      )}

      {type !== "password" && (
        <InfoCircle
          className={cx(
            "pointer-events-none absolute hidden size-4 stroke-[2.25px] text-fg-error-secondary group-invalid/input:block",
            tooltipPosition === "leading"
              ? inputSizes[inputSize].leadingIcon
              : inputSizes[inputSize].trailingIcon,
            context.tooltipClassName,
            tooltipClassName,
          )}
        />
      )}

      {type === "password" && (
        <AriaButton
          aria-label="Toggle password visibility"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className={cx(
            "absolute flex cursor-pointer items-center justify-center text-input-icon transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover focus:outline-hidden",
            inputSizes[inputSize].trailingIcon,
          )}
        >
          {isPasswordVisible ? (
            <EyeOff className="size-4 stroke-[2.25px]" />
          ) : (
            <Eye className="size-4 stroke-[2.25px]" />
          )}
        </AriaButton>
      )}

      {shortcut && (
        <div
          className={cx(
            "pointer-events-none absolute inset-y-0.5 right-0.5 z-10 hidden items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-primary to-40% pl-8 md:flex",
            inputSizes[inputSize].shortcut,
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-secondary select-none ring-inset"
          >
            {typeof shortcut === "string" ? shortcut : "Cmd K"}
          </span>
        </div>
      )}
    </AriaGroup>
  );
}

InputBase.displayName = "InputBase";

type TextFieldContextProps = Partial<
  Pick<
    InputBaseProps,
    "iconClassName" | "inputClassName" | "size" | "tooltipClassName" | "wrapperClassName"
  >
>;

const TextFieldContext = createContext<TextFieldContextProps>({});

export type TextFieldProps = AriaTextFieldProps & TextFieldContextProps;

export function TextField({
  className,
  iconClassName,
  inputClassName,
  size = "md",
  tooltipClassName,
  wrapperClassName,
  ...props
}: TextFieldProps) {
  return (
    <TextFieldContext.Provider
      value={{ iconClassName, inputClassName, size, tooltipClassName, wrapperClassName }}
    >
      <AriaTextField
        {...props}
        data-input-size={size}
        data-input-wrapper
        className={(state) =>
          cx(
            "group flex h-max w-full flex-col items-start justify-start gap-1.5",
            typeof className === "function" ? className(state) : className,
          )
        }
      />
    </TextFieldContext.Provider>
  );
}

TextField.displayName = "TextField";

export type InputProps = AriaTextFieldProps &
  Pick<
    InputBaseProps,
    | "groupRef"
    | "icon"
    | "iconClassName"
    | "iconPosition"
    | "inputClassName"
    | "placeholder"
    | "ref"
    | "shortcut"
    | "size"
    | "tooltip"
    | "tooltipClassName"
    | "tooltipPosition"
    | "wrapperClassName"
  > & {
    hideRequiredIndicator?: boolean;
    hint?: ReactNode;
    label?: string;
    requiredIndicatorPosition?: RequiredIndicatorPosition;
  };

export function Input({
  className,
  groupRef,
  hideRequiredIndicator,
  hint,
  icon,
  iconClassName,
  iconPosition,
  inputClassName,
  label,
  placeholder,
  ref,
  requiredIndicatorPosition,
  shortcut,
  size = "md",
  tooltip,
  tooltipClassName,
  tooltipPosition,
  type = "text",
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <TextField
      aria-label={label ? undefined : placeholder}
      {...props}
      size={size}
      className={className}
    >
      {({ isInvalid, isRequired }) => (
        <>
          {label && (
            <Label
              indicatorPosition={requiredIndicatorPosition}
              isInvalid={isInvalid}
              isRequired={hideRequiredIndicator ? false : isRequired}
            >
              {label}
            </Label>
          )}

          <InputBase
            groupRef={groupRef}
            isDisabled={props.isDisabled}
            isInvalid={isInvalid}
            isRequired={isRequired}
            icon={icon}
            iconClassName={iconClassName}
            iconPosition={iconPosition}
            inputClassName={inputClassName}
            placeholder={placeholder}
            ref={ref}
            shortcut={shortcut}
            size={size}
            tooltip={tooltip}
            tooltipClassName={tooltipClassName}
            tooltipPosition={tooltipPosition}
            type={type}
            wrapperClassName={wrapperClassName}
          />

          {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
        </>
      )}
    </TextField>
  );
}

Input.displayName = "Input";

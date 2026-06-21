"use client";

import { Eye, EyeOff, HelpCircle, InfoCircle } from "@untitledui/icons";
import {
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  createContext,
  useContext,
  useState,
} from "react";
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
import { cx, sortCx } from "../../../cn";
import { Tooltip, TooltipTrigger } from "../tooltip/tooltip";
import { HintText } from "./hint-text";
import { Label } from "./label";

export interface InputBaseProps extends Omit<AriaInputProps, "size"> {
  /** Tooltip message on hover. */
  tooltip?: string;
  /** Whether the input is invalid. */
  isInvalid?: boolean;
  /** Whether the input is disabled. */
  isDisabled?: boolean;
  /** Whether the input is required. */
  isRequired?: boolean;
  /**
   * Input size.
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
  /** Placeholder text. */
  placeholder?: string;
  /** Class name for the icon. */
  iconClassName?: string;
  /** Class name for the input. */
  inputClassName?: string;
  /** Class name for the label. */
  labelClassName?: string;
  /** Class name for the helper text. */
  hintClassName?: string;
  /** Class name for the input wrapper. */
  wrapperClassName?: string;
  /** Class name for the tooltip. */
  tooltipClassName?: string;
  /** Keyboard shortcut to display. */
  shortcut?: string | boolean;
  ref?: Ref<HTMLInputElement>;
  groupRef?: Ref<HTMLDivElement>;
  /** Icon component to display on the left side of the input. */
  icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement>>;
}

export const InputBase = ({
  ref,
  tooltip,
  shortcut,
  groupRef,
  size = "md",
  isInvalid,
  isDisabled,
  isRequired,
  icon: Icon,
  placeholder,
  wrapperClassName,
  tooltipClassName,
  inputClassName,
  iconClassName,
  type = "text",
  ...inputProps
}: InputBaseProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Check if the input has a leading icon or tooltip
  const hasTrailingIcon = tooltip || isInvalid;
  const hasLeadingIcon = Icon;

  // If the input is inside a `TextFieldContext`, use its context to simplify applying styles
  const context = useContext(TextFieldContext);

  const inputSize = context?.size || size;

  const sizes = sortCx({
    sm: {
      root: cx("px-3 py-2 text-sm", hasLeadingIcon && "pl-9", hasTrailingIcon && "pr-9"),
      iconLeading: "left-3 size-4 stroke-[2.25px]",
      iconTrailing: "right-3",
      shortcut: "pr-1.5",
    },
    md: {
      root: cx(
        "px-3 py-2 text-base leading-6",
        hasLeadingIcon && "pl-10",
        hasTrailingIcon && "pr-9",
      ),
      iconLeading: "left-3 size-5",
      iconTrailing: "right-3",
      shortcut: "pr-2",
    },
    lg: {
      root: cx(
        "px-3.5 py-2.5 text-base leading-6",
        hasLeadingIcon && "pl-10",
        hasTrailingIcon && "pr-10",
      ),
      iconLeading: "left-3.5 size-5",
      iconTrailing: "right-3.5",
      shortcut: "pr-2.5",
    },
  });
  return (
    <AriaGroup
      {...{ isDisabled, isInvalid }}
      ref={groupRef}
      className={({ isFocusWithin, isDisabled, isInvalid }) =>
        cx(
          "group/input relative flex w-full flex-row place-content-center place-items-center rounded-md bg-(--input-bg) shadow-(--shadow-xs) ring-1 ring-(--input-border) transition-shadow duration-100 ease-linear ring-inset",

          isFocusWithin && !isDisabled && "ring-2 ring-(--input-border-focus)",

          // Disabled state styles
          isDisabled && "cursor-not-allowed",
          "group-disabled:cursor-not-allowed",

          // Invalid state styles
          isInvalid && "ring-red-600",
          "group-invalid:ring-red-600",

          // Invalid state with focus-within styles
          isInvalid && isFocusWithin && "ring-2 ring-red-700",
          isFocusWithin && "group-invalid:ring-2 group-invalid:ring-red-700",

          context?.wrapperClassName,
          wrapperClassName,
        )
      }
    >
      {/* Leading icon and Payment icon */}
      {Icon && (
        <Icon
          className={cx(
            "pointer-events-none absolute text-(--input-icon-fg)",
            sizes[inputSize].iconLeading,
            context?.iconClassName,
            iconClassName,
          )}
        />
      )}

      {/* Input field */}
      <AriaInput
        {...(inputProps as AriaInputProps)}
        ref={ref}
        disabled={isDisabled}
        required={isRequired}
        type={type === "password" && isPasswordVisible ? "text" : type}
        placeholder={placeholder}
        className={cx(
          "m-0 w-full bg-transparent text-(--input-fg) ring-0 outline-hidden placeholder:text-(--input-fg-placeholder) autofill:rounded-md autofill:text-(--input-fg) disabled:cursor-not-allowed disabled:text-(--input-fg-disabled)",
          sizes[inputSize].root,
          context?.inputClassName,
          inputClassName,
        )}
      />

      {/* Tooltip and help icon */}
      {tooltip && type !== "password" && (
        <Tooltip title={tooltip} placement="top">
          <TooltipTrigger
            className={cx(
              "absolute cursor-pointer text-(--input-icon-fg) transition duration-100 ease-linear group-invalid/input:hidden hover:text-gray-50 focus:text-gray-50",
              sizes[inputSize].iconTrailing,
              context?.tooltipClassName,
              tooltipClassName,
            )}
          >
            <HelpCircle className="size-4 stroke-[2.25px]" width={15} height={15} />
          </TooltipTrigger>
        </Tooltip>
      )}

      {/* Invalid icon */}
      {type !== "password" && (
        <InfoCircle
          className={cx(
            "pointer-events-none absolute hidden size-4 stroke-[2.25px] text-red-700 group-invalid/input:block",
            sizes[inputSize].iconTrailing,
            context?.tooltipClassName,
            tooltipClassName,
          )}
        />
      )}

      {/* Password visibility toggle */}
      {type === "password" && (
        <AriaButton
          aria-label="Toggle password visibility"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className={cx(
            "absolute flex cursor-pointer items-center justify-center text-(--input-icon-fg) transition duration-100 ease-linear hover:text-gray-50 focus:text-gray-50 focus:outline-hidden",
            sizes[inputSize].iconTrailing,
          )}
        >
          {isPasswordVisible ? (
            <EyeOff className="size-4 stroke-[2.25px]" />
          ) : (
            <Eye className="size-4 stroke-[2.25px]" />
          )}
        </AriaButton>
      )}

      {/* Shortcut */}
      {shortcut && (
        <div
          className={cx(
            "pointer-events-none absolute inset-y-0.5 right-0.5 z-10 hidden items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-(--input-bg) to-40% pl-8 md:flex",
            sizes[inputSize].shortcut,
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none rounded px-1 py-px text-xs font-medium text-gray-50 ring-1 ring-gray-20 select-none ring-inset"
          >
            {typeof shortcut === "string" ? shortcut : "⌘K"}
          </span>
        </div>
      )}
    </AriaGroup>
  );
};

InputBase.displayName = "InputBase";

interface TextFieldContextProps
  extends Partial<
    Pick<
      InputBaseProps,
      | "size"
      | "wrapperClassName"
      | "inputClassName"
      | "iconClassName"
      | "tooltipClassName"
      | "labelClassName"
      | "hintClassName"
    >
  > {}

const TextFieldContext = createContext<TextFieldContextProps>({});

export interface TextFieldProps extends AriaTextFieldProps, TextFieldContextProps {}

export const TextField = ({
  className,
  size = "md",
  inputClassName,
  labelClassName,
  hintClassName,
  wrapperClassName,
  iconClassName,
  tooltipClassName,
  ...props
}: TextFieldProps) => {
  return (
    <TextFieldContext.Provider
      value={{
        inputClassName,
        labelClassName,
        hintClassName,
        wrapperClassName,
        iconClassName,
        tooltipClassName,
        size,
      }}
    >
      <AriaTextField
        {...props}
        data-input-wrapper
        data-input-size={size}
        className={(state) =>
          cx(
            "group flex h-max w-full flex-col items-start justify-start gap-1.5 w-full",
            typeof className === "function" ? className(state) : className,
          )
        }
      />
    </TextFieldContext.Provider>
  );
};

TextField.displayName = "TextField";

export interface InputProps
  extends AriaTextFieldProps,
    Pick<
      InputBaseProps,
      | "ref"
      | "placeholder"
      | "icon"
      | "shortcut"
      | "tooltip"
      | "groupRef"
      | "size"
      | "wrapperClassName"
      | "inputClassName"
      | "labelClassName"
      | "hintClassName"
      | "iconClassName"
      | "tooltipClassName"
    > {
  /** Label text for the input */
  label?: string;
  /** Helper text displayed below the input */
  hint?: ReactNode;
  /** Whether to hide required indicator from label */
  hideRequiredIndicator?: boolean;
}

export const Input = ({
  size = "md",
  placeholder,
  icon: Icon,
  label,
  hint,
  shortcut,
  hideRequiredIndicator,
  className,
  ref,
  groupRef,
  tooltip,
  iconClassName,
  inputClassName,
  labelClassName,
  hintClassName,
  wrapperClassName,
  tooltipClassName,
  type = "text",
  ...props
}: InputProps) => {
  return (
    <TextField
      aria-label={!label ? placeholder : undefined}
      {...props}
      size={size}
      className={className}
      labelClassName={labelClassName}
      hintClassName={hintClassName}
    >
      {({ isRequired, isInvalid }) => (
        <>
          {label && (
            <Label
              isRequired={hideRequiredIndicator ? !hideRequiredIndicator : isRequired}
              isInvalid={isInvalid}
              className={labelClassName}
            >
              {label}
            </Label>
          )}

          <InputBase
            {...{
              ref,
              groupRef,
              size,
              placeholder,
              icon: Icon,
              shortcut,
              iconClassName,
              inputClassName,
              wrapperClassName,
              tooltipClassName,
              tooltip,
              type,
              isDisabled: props.isDisabled,
            }}
          />

          {hint && (
            <HintText isInvalid={isInvalid} className={hintClassName}>
              {hint}
            </HintText>
          )}
        </>
      )}
    </TextField>
  );
};

Input.displayName = "Input";

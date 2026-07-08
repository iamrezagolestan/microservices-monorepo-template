"use client";

import type { ReactNode } from "react";
import type {
  ButtonProps as AriaButtonProps,
  ListBoxItemProps as AriaListBoxItemProps,
  ListBoxProps as AriaListBoxProps,
  PopoverProps as AriaPopoverProps,
  SelectProps as AriaSelectProps,
} from "react-aria-components";
import {
  Button as AriaButton,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
} from "react-aria-components";
import { cx } from "@/utils/cx";

export type SelectProps<T extends object> = AriaSelectProps<T> & {
  children: ReactNode;
};

export function Select<T extends object>({ children, className, ...props }: SelectProps<T>) {
  return (
    <AriaSelect
      {...props}
      className={(state) =>
        cx("relative flex w-full flex-col", typeof className === "function" ? className(state) : className)
      }
    >
      {children}
    </AriaSelect>
  );
}

export type SelectTriggerProps = AriaButtonProps;

export function SelectTrigger({ children, className, ...props }: SelectTriggerProps) {
  return (
    <AriaButton
      {...props}
      className={(state) =>
        cx(
          "flex w-full cursor-pointer items-center justify-between rounded-lg bg-tertiary text-primary outline-focus-ring transition duration-100 ease-linear focus:ring-2 focus:ring-focus-ring disabled:cursor-not-allowed disabled:text-quaternary",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
    </AriaButton>
  );
}

export function SelectValue<T extends object>() {
  return <AriaSelectValue<T> className="text-md font-semibold text-primary" />;
}

export type SelectPopoverProps = AriaPopoverProps;

export function SelectPopover({ children, className, ...props }: SelectPopoverProps) {
  return (
    <AriaPopover
      {...props}
      className={(state) =>
        cx(
          "z-50 rounded-lg border border-primary bg-primary_hover shadow-lg",
          state.isEntering && "ease-out animate-in fade-in zoom-in-95",
          state.isExiting && "ease-in animate-out fade-out zoom-out-95",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
    </AriaPopover>
  );
}

export type SelectListBoxProps<T extends object> = AriaListBoxProps<T>;

export function SelectListBox<T extends object>({
  children,
  className,
  ...props
}: SelectListBoxProps<T>) {
  return (
    <AriaListBox
      {...props}
      className={(state) =>
        cx(
          "max-h-72 overflow-y-auto outline-hidden",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
    </AriaListBox>
  );
}

export type SelectItemProps<T extends object = object> = AriaListBoxItemProps<T>;

export function SelectItem<T extends object = object>({
  children,
  className,
  ...props
}: SelectItemProps<T>) {
  return (
    <AriaListBoxItem
      {...props}
      className={(state) =>
        cx(
          "cursor-pointer outline-hidden transition duration-100 ease-linear",
          state.isFocused && "bg-primary",
          state.isSelected && "bg-primary",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
    </AriaListBoxItem>
  );
}

Select.displayName = "Select";
SelectTrigger.displayName = "SelectTrigger";
SelectValue.displayName = "SelectValue";
SelectPopover.displayName = "SelectPopover";
SelectListBox.displayName = "SelectListBox";
SelectItem.displayName = "SelectItem";

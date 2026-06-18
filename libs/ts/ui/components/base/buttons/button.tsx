"use client";

import {
  type ComponentType,
  type ReactElement,
  type ReactNode,
  createElement,
  isValidElement,
} from "react";
import type {
  ButtonProps as AriaButtonProps,
  LinkProps as AriaLinkProps,
} from "react-aria-components";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { cx, sortCx } from "../../../cn";

export const styles = sortCx({
  common: {
    root: [
      "group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-100",
      "*:data-icon:pointer-events-none *:data-icon:shrink-0 *:data-icon:transition-inherit-all",
    ].join(" "),
    icon: "pointer-events-none shrink-0 transition-inherit-all",
  },
  sizes: {
    xs: {
      root: "gap-1 rounded-md px-2.5 py-1.5 text-sm leading-5 font-semibold before:rounded-[7px] data-icon-only:p-2 *:data-icon:size-4 *:data-icon:stroke-[2.25px]",
      linkRoot: "gap-1 text-sm leading-5 font-medium *:data-text:underline-offset-3",
    },
    sm: {
      root: "gap-1 rounded-md px-3 py-2 text-md leading-5 font-semibold before:rounded-[7px] data-icon-only:p-2 *:data-icon:size-5 *:data-icon:stroke-[1.67px]",
      linkRoot:
        "gap-1 text-sm leading-5 font-medium *:data-icon:size-4 *:data-icon:stroke-[2.25px] *:data-text:underline-offset-3",
    },
    md: {
      root: "gap-1 rounded-md px-3.5 py-2 text-md leading-5 font-semibold before:rounded-[7px] data-icon-only:p-2.5 *:data-icon:size-5 *:data-icon:stroke-[1.67px]",
      linkRoot:
        "gap-1 text-sm leading-5 font-medium *:data-icon:size-4 *:data-icon:stroke-[2.25px] *:data-text:underline-offset-4",
    },
    lg: {
      root: "gap-1 rounded-md px-4 py-2.5 text-md leading-5 font-semibold before:rounded-[7px] data-icon-only:p-3 *:data-icon:size-5 *:data-icon:stroke-[1.67px]",
      linkRoot:
        "gap-1.5 text-sm leading-5 font-medium *:data-icon:size-4 *:data-icon:stroke-[2.25px] *:data-text:underline-offset-4",
    },
    xl: {
      root: "gap-1.5 rounded-md px-[18px] py-3 text-md leading-5 font-semibold before:rounded-[7px] data-icon-only:p-3.5 *:data-icon:size-5 *:data-icon:stroke-[1.67px]",
      linkRoot:
        "gap-1.5 text-sm leading-5 font-medium *:data-icon:size-4 *:data-icon:stroke-[2.25px] *:data-text:underline-offset-4",
    },
  },
  colors: {
    primary: {
      root: [
        "border-2 border-(--button-primary-border) bg-(--button-primary-bg) text-(--button-primary-fg) shadow-(--shadow-xs) hover:bg-(--button-primary-bg-hover) data-loading:bg-(--button-primary-bg)",
        "before:inset-0 before:rounded-[inherit] before:shadow-(--shadow-skeuomorphic)",
        "disabled:border disabled:border-gray-0 disabled:bg-(--button-primary-bg-disabled) disabled:text-(--button-primary-fg)",
        "focus-visible:shadow-(--button-focus-ring)",
        "*:data-icon:text-current",
      ].join(" "),
    },
    secondary: {
      root: [
        "border border-(--button-secondary-border) bg-(--button-secondary-bg) text-(--button-secondary-fg) shadow-(--shadow-xs) hover:border-(--button-secondary-border-hover) hover:bg-(--button-secondary-bg-hover) hover:text-(--button-secondary-fg-hover) data-loading:bg-(--button-secondary-bg)",
        "before:inset-0 before:rounded-[inherit] before:shadow-(--shadow-skeuomorphic)",
        "disabled:border-(--button-secondary-border-disabled) disabled:bg-(--button-secondary-bg-disabled) disabled:text-(--button-secondary-fg-disabled)",
        "focus-visible:shadow-(--button-focus-ring-secondary)",
        "*:data-icon:text-current",
      ].join(" "),
    },
    tertiary: {
      root: [
        "border border-transparent bg-transparent text-(--button-secondary-fg) hover:bg-(--button-secondary-bg-hover) hover:text-(--button-secondary-fg-hover)",
        "disabled:text-(--button-secondary-fg-disabled)",
        "focus-visible:shadow-(--button-focus-ring-secondary)",
        "*:data-icon:text-current",
      ].join(" "),
    },
    text: {
      root: [
        "border border-transparent bg-transparent text-(--button-text-fg) hover:text-(--button-text-fg-hover)",
        "disabled:text-(--button-text-fg-disabled)",
        "focus-visible:shadow-none focus-visible:*:data-text:underline",
        "*:data-icon:text-current",
      ].join(" "),
    },
    "link-color": {
      root: [
        "justify-normal rounded p-0! text-(--button-text-fg) hover:text-(--button-text-fg-hover)",
        "disabled:text-(--button-text-fg-disabled)",
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-current",
        "*:data-icon:text-current",
      ].join(" "),
    },
    "link-gray": {
      root: [
        "justify-normal rounded p-0! text-(--button-secondary-fg) hover:text-(--button-secondary-fg-hover)",
        "disabled:text-(--button-secondary-fg-disabled)",
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-current",
        "*:data-icon:text-current",
      ].join(" "),
    },
    "primary-destructive": {
      root: [
        "border-2 border-(--button-primary-border) bg-red-600 text-white shadow-(--shadow-xs) hover:bg-red-700",
        "before:inset-0 before:rounded-[inherit] before:shadow-(--shadow-skeuomorphic)",
        "disabled:border disabled:border-gray-0 disabled:bg-red-300",
        "focus-visible:shadow-(--button-focus-ring-destructive)",
        "*:data-icon:text-current",
      ].join(" "),
    },
    "secondary-destructive": {
      root: [
        "border border-red-300 bg-gray-0 text-red-700 shadow-(--shadow-xs) hover:bg-red-50 hover:text-red-700",
        "before:inset-0 before:rounded-[inherit] before:shadow-(--shadow-skeuomorphic)",
        "disabled:border-red-100 disabled:bg-red-50 disabled:text-red-300",
        "focus-visible:shadow-(--button-focus-ring-destructive)",
        "*:data-icon:text-current",
      ].join(" "),
    },
    "tertiary-destructive": {
      root: [
        "border border-transparent bg-transparent text-red-700 hover:bg-red-50",
        "disabled:text-red-300",
        "focus-visible:shadow-(--button-focus-ring-destructive)",
        "*:data-icon:text-current",
      ].join(" "),
    },
    "link-destructive": {
      root: [
        "justify-normal rounded p-0! text-red-700 hover:text-red-700",
        "disabled:text-red-300",
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-current",
        "*:data-icon:text-current",
      ].join(" "),
    },
  },
});

type IconComponent = ComponentType<{
  className?: string;
  "data-icon"?: string;
  strokeWidth?: number;
}>;
type IconProp = IconComponent | ReactNode;
type LegacyVariant = "primary" | "secondary" | "ghost";
type ButtonColor = keyof typeof styles.colors;
type ButtonSize = keyof typeof styles.sizes;

export interface CommonProps {
  isDisabled?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  size?: ButtonSize;
  color?: ButtonColor;
  variant?: LegacyVariant;
  iconLeading?: IconProp;
  iconTrailing?: IconProp;
  noTextPadding?: boolean;
  showTextWhileLoading?: boolean;
  children?: ReactNode;
  className?: string;
}

export interface ButtonProps
  extends CommonProps,
    Omit<AriaButtonProps, "children" | "className" | "isDisabled"> {}

interface LinkProps extends CommonProps, Omit<AriaLinkProps, "children" | "className"> {
  href: NonNullable<AriaLinkProps["href"]>;
}

export type Props = ButtonProps | LinkProps;

const legacyVariantColors: Record<LegacyVariant, ButtonColor> = {
  primary: "primary",
  secondary: "secondary",
  ghost: "tertiary",
};
const linkColors: ReadonlySet<ButtonColor> = new Set([
  "link-gray",
  "link-color",
  "link-destructive",
]);
const textSizedColors: ReadonlySet<ButtonColor> = new Set([
  "text",
  "link-gray",
  "link-color",
  "link-destructive",
]);

function renderIcon(icon: IconProp, position: "leading" | "trailing") {
  if (!icon) {
    return null;
  }

  if (isValidElement(icon)) {
    return icon;
  }

  if (isRenderableComponent(icon)) {
    const Icon = icon as IconComponent;
    return createElement(Icon, {
      "data-icon": position,
      className: styles.common.icon,
      strokeWidth: 1.67,
    });
  }

  return null;
}

function isRenderableComponent(icon: IconProp): icon is IconComponent {
  if (typeof icon === "function") {
    return true;
  }

  if (typeof icon !== "object" || icon === null) {
    return false;
  }

  const candidate = icon as { $$typeof?: { toString(): string } };

  return candidate.$$typeof?.toString() === "Symbol(react.forward_ref)";
}

export const Button: {
  (props: LinkProps): ReactElement<LinkProps>;
  (props: ButtonProps): ReactElement<ButtonProps>;
} = ({
  size = "sm",
  color,
  variant,
  children,
  className,
  noTextPadding,
  iconLeading,
  iconTrailing,
  isDisabled,
  disabled,
  isLoading,
  showTextWhileLoading,
  ...props
}) => {
  const href = "href" in props ? props.href : undefined;
  const resolvedColor = color ?? (variant ? legacyVariantColors[variant] : "primary");
  const isIcon = Boolean((iconLeading || iconTrailing) && !children);
  const isLinkType = linkColors.has(resolvedColor);
  const usesTextSizing = textSizedColors.has(resolvedColor);
  const isUnavailable = Boolean(isDisabled || disabled || isLoading);
  const shouldRemoveTextPadding = noTextPadding || isLinkType;
  const textClassName = cx("transition-inherit-all", !shouldRemoveTextPadding && "px-0.5");

  const commonChildren = (
    <>
      {renderIcon(iconLeading, "leading")}

      {isLoading && (
        <svg
          aria-hidden="true"
          fill="none"
          data-icon="loading"
          viewBox="0 0 20 20"
          className={cx(
            styles.common.icon,
            "size-5",
            !showTextWhileLoading && "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          )}
        >
          <circle
            className="stroke-current opacity-30"
            cx="10"
            cy="10"
            r="8"
            fill="none"
            strokeWidth="2"
          />
          <circle
            className="origin-center animate-spin stroke-current"
            cx="10"
            cy="10"
            r="8"
            fill="none"
            strokeWidth="2"
            strokeDasharray="12.5 50"
            strokeLinecap="round"
          />
        </svg>
      )}

      {children && (
        <span data-text className={textClassName}>
          {children}
        </span>
      )}

      {renderIcon(iconTrailing, "trailing")}
    </>
  );

  const commonProps = {
    "data-loading": isLoading ? true : undefined,
    "data-icon-only": isIcon ? true : undefined,
    ...props,
    isDisabled: isUnavailable,
    className: cx(
      styles.common.root,
      styles.sizes[size].root,
      styles.colors[resolvedColor].root,
      usesTextSizing && styles.sizes[size].linkRoot,
      (isLoading || (href && isUnavailable)) && "pointer-events-none",
      isLoading &&
        (showTextWhileLoading
          ? "[&>*:not([data-icon=loading]):not([data-text])]:hidden"
          : "[&>*:not([data-icon=loading])]:invisible"),
      className,
    ),
    children: commonChildren,
  };

  if ("href" in commonProps) {
    return <AriaLink {...commonProps} href={isUnavailable ? undefined : href} />;
  }

  return <AriaButton {...commonProps} type={commonProps.type || "button"} isPending={isLoading} />;
};

"use client";

import type { ComponentType, ReactElement, ReactNode } from "react";
import { isValidElement } from "react";
import type {
  ButtonProps as AriaButtonProps,
  LinkProps as AriaLinkProps,
} from "react-aria-components";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { cx, sortCx } from "@/lib/cn";

type IconComponent = ComponentType<{ className?: string; "data-icon"?: string }>;

function isIconComponent(icon: unknown): icon is IconComponent {
  return typeof icon === "function";
}

export const styles = sortCx({
  common: {
    root: [
      "group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap rounded-md font-semibold shadow-(--shadow-xs) outline-none transition duration-100 ease-linear w-full h-full",
      "disabled:cursor-not-allowed data-disabled:cursor-not-allowed",
      "*:data-icon:pointer-events-none *:data-icon:shrink-0 *:data-icon:transition-inherit-all",
    ].join(" "),
    icon: "pointer-events-none shrink-0 transition-inherit-all",
    iconOnlySizes: {
      xs: "p-2",
      sm: "p-2",
      md: "p-2.5",
      lg: "p-3",
      xl: "p-3.5",
    },
  },
  sizes: {
    xs: {
      root: "gap-1 px-2.5 py-1.5 text-xs leading-5",
      textRoot: "gap-1 px-2.5 py-1.5 text-xs leading-5 *:data-icon:size-4",
      linkRoot: "gap-1 *:data-text:underline-offset-3",
    },
    sm: {
      root: "gap-1 px-3 py-2 text-md leading-5",
      textRoot: "gap-1 px-3 py-2 text-sm font-medium leading-5 *:data-icon:size-4",
      linkRoot: "gap-1 *:data-text:underline-offset-3",
    },
    md: {
      root: "gap-1 px-3.5 py-2.5 text-md leading-5",
      textRoot: "gap-1 px-3.5 py-2.5 text-sm font-medium leading-5 *:data-icon:size-4",
      linkRoot: "gap-1 *:data-text:underline-offset-4",
    },
    lg: {
      root: "gap-1.5 px-4 py-2.5 text-md leading-5",
      textRoot: "gap-1.5 px-4 py-2.5 text-sm font-medium leading-5 *:data-icon:size-4",
      linkRoot: "gap-1.5 *:data-text:underline-offset-4",
    },
    xl: {
      root: "gap-1.5 px-4 py-3 text-md leading-5",
      textRoot: "gap-1.5 px-4 py-3 text-sm font-medium leading-5 *:data-icon:size-4",
      linkRoot: "gap-1.5 *:data-text:underline-offset-4",
    },
  },
  colors: {
    primary: {
      root: [
        "border-2 border-(--button-primary-border) bg-(--button-primary-bg) text-(--button-primary-fg) [box-shadow:var(--shadow-xs),var(--shadow-skeuomorphic)]",
        "hover:bg-(--button-primary-bg-hover) data-loading:bg-(--button-primary-bg)",
        "focus:shadow-(--button-focus-ring) focus-visible:shadow-(--button-focus-ring)",
        "disabled:border-gray-0 disabled:bg-(--button-primary-bg-disabled) disabled:text-(--button-primary-fg)",
        "data-disabled:border-gray-0 data-disabled:bg-(--button-primary-bg-disabled) data-disabled:text-(--button-primary-fg)",
        "*:data-icon:text-(--button-primary-fg)",
      ].join(" "),
    },
    secondary: {
      root: [
        "border border-(--button-secondary-border) bg-(--button-secondary-bg) text-(--button-secondary-fg) [box-shadow:var(--shadow-xs),var(--shadow-skeuomorphic)]",
        "hover:border-(--button-secondary-border-hover) hover:bg-(--button-secondary-bg-hover) hover:text-(--button-secondary-fg-hover)",
        "data-loading:bg-(--button-secondary-bg)",
        "focus-visible:border-(--button-secondary-border-hover) focus:shadow-(--button-focus-ring-secondary) focus-visible:shadow-(--button-focus-ring-secondary)",
        "disabled:border-(--button-secondary-border-disabled) disabled:bg-(--button-secondary-bg-disabled) disabled:text-(--button-secondary-fg-disabled)",
        "data-disabled:border-(--button-secondary-border-disabled) data-disabled:bg-(--button-secondary-bg-disabled) data-disabled:text-(--button-secondary-fg-disabled)",
        "*:data-icon:text-(--button-secondary-icon) hover:*:data-icon:text-(--button-secondary-icon-hover)",
        "disabled:*:data-icon:text-(--button-secondary-icon-disabled) data-disabled:*:data-icon:text-(--button-secondary-icon-disabled)",
      ].join(" "),
    },
    tertiary: {
      root: [
        "border border-transparent text-(--button-secondary-fg) shadow-none hover:bg-(--button-secondary-bg-hover) hover:text-(--button-secondary-fg-hover)",
        "focus:shadow-(--button-focus-ring-secondary) focus-visible:shadow-(--button-focus-ring-secondary)",
        "disabled:text-(--button-secondary-fg-disabled) data-disabled:text-(--button-secondary-fg-disabled)",
        "*:data-icon:text-(--button-secondary-icon) hover:*:data-icon:text-(--button-secondary-icon-hover)",
      ].join(" "),
    },
    text: {
      root: [
        "border border-transparent bg-transparent text-(--button-text-fg) shadow-none drop-shadow-[0_1px_1px_var(--shadow-xs-color)]",
        "hover:text-(--button-text-fg-hover)",
        "focus:text-(--button-text-fg) focus:*:data-text:underline focus-visible:text-(--button-text-fg) focus-visible:*:data-text:underline",
        "disabled:text-(--button-text-fg-disabled) disabled:*:data-text:underline data-disabled:text-(--button-text-fg-disabled) data-disabled:*:data-text:underline",
        "*:data-icon:text-current",
      ].join(" "),
    },
    "link-color": {
      root: [
        "justify-normal rounded p-0! text-(--button-text-fg) shadow-none hover:text-(--button-text-fg-hover)",
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-current",
        "*:data-icon:text-current",
      ].join(" "),
    },
    "link-gray": {
      root: [
        "justify-normal rounded p-0! text-(--button-secondary-fg) shadow-none hover:text-(--button-secondary-fg-hover)",
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-current",
        "*:data-icon:text-current",
      ].join(" "),
    },
    "primary-destructive": {
      root: [
        "border-2 border-(--button-primary-border) bg-red-600 text-white [box-shadow:var(--shadow-xs),var(--shadow-skeuomorphic)]",
        "hover:bg-red-700 focus:shadow-(--button-focus-ring-destructive) focus-visible:shadow-(--button-focus-ring-destructive)",
        "*:data-icon:text-white",
      ].join(" "),
    },
    "secondary-destructive": {
      root: [
        "border border-red-300 bg-white text-red-700 [box-shadow:var(--shadow-xs),var(--shadow-skeuomorphic)]",
        "hover:bg-red-50 focus:shadow-(--button-focus-ring-destructive) focus-visible:shadow-(--button-focus-ring-destructive)",
        "*:data-icon:text-red-600",
      ].join(" "),
    },
    "tertiary-destructive": {
      root: [
        "border border-transparent text-red-700 shadow-none hover:bg-red-50 hover:text-red-700",
        "focus:shadow-(--button-focus-ring-destructive) focus-visible:shadow-(--button-focus-ring-destructive) *:data-icon:text-red-600",
      ].join(" "),
    },
    "link-destructive": {
      root: [
        "justify-normal rounded p-0! text-red-700 shadow-none hover:text-red-700",
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-current",
        "*:data-icon:text-current",
      ].join(" "),
    },
  },
});

export interface CommonProps {
  disabled?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  size?: keyof typeof styles.sizes;
  color?: keyof typeof styles.colors;
  iconLeading?: IconComponent | ReactNode;
  iconTrailing?: IconComponent | ReactNode;
  noTextPadding?: boolean;
  showTextWhileLoading?: boolean;
  children?: ReactNode;
  className?: string;
}

export interface ButtonProps extends CommonProps, Omit<AriaButtonProps, "children" | "className"> {}

interface LinkProps extends CommonProps, Omit<AriaLinkProps, "children" | "className"> {
  href: NonNullable<AriaLinkProps["href"]>;
}

export type Props = ButtonProps | LinkProps;

export const Button: {
  (props: LinkProps): ReactElement<LinkProps>;
  (props: ButtonProps): ReactElement<ButtonProps>;
} = ({
  size = "sm",
  color = "primary",
  children,
  className,
  noTextPadding,
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  disabled: nativeDisabled,
  isDisabled: ariaDisabled,
  isLoading: loading,
  showTextWhileLoading,
  ...props
}) => {
  const href = "href" in props ? props.href : undefined;
  const disabled = Boolean(ariaDisabled || nativeDisabled);
  const isIcon = Boolean((IconLeading || IconTrailing) && !children);
  const isLinkType =
    color === "link-gray" || color === "link-color" || color === "link-destructive";
  const textPadding = isLinkType || noTextPadding ? "" : "px-0.5";
  const sizeClasses = color === "text" ? styles.sizes[size].textRoot : styles.sizes[size].root;
  const iconOnlyClasses = isIcon ? styles.common.iconOnlySizes[size] : "";
  const iconClasses = cx(styles.common.icon, color === "text" ? "size-4" : "size-5");

  const commonChildren = (
    <>
      {isValidElement(IconLeading) && IconLeading}
      {isIconComponent(IconLeading) && <IconLeading data-icon="leading" className={iconClasses} />}

      {loading && (
        <svg
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
        <span data-text className={cx("transition-inherit-all", textPadding)}>
          {children}
        </span>
      )}

      {isValidElement(IconTrailing) && IconTrailing}
      {isIconComponent(IconTrailing) && (
        <IconTrailing data-icon="trailing" className={iconClasses} />
      )}
    </>
  );

  const commonProps = {
    "data-loading": loading ? true : undefined,
    "data-icon-only": isIcon ? true : undefined,
    ...props,
    isDisabled: disabled,
    className: cx(
      styles.common.root,
      sizeClasses,
      iconOnlyClasses,
      styles.colors[color].root,
      isLinkType && styles.sizes[size].linkRoot,
      (loading || (href && (disabled || loading))) && "pointer-events-none",
      loading &&
        (showTextWhileLoading
          ? "[&>*:not([data-icon=loading]):not([data-text])]:hidden"
          : "[&>*:not([data-icon=loading])]:invisible"),
      className,
    ),
    children: commonChildren,
  };

  if ("href" in commonProps) {
    return <AriaLink {...commonProps} href={disabled ? undefined : href} />;
  }

  return <AriaButton {...commonProps} type={commonProps.type || "button"} isPending={loading} />;
};

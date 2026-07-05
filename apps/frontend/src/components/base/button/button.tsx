"use client";

import type { FC, ReactElement, ReactNode } from "react";
import { isValidElement } from "react";
import type {
  ButtonProps as AriaButtonProps,
  LinkProps as AriaLinkProps,
} from "react-aria-components";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { cx } from "@/utils/cx";

type ButtonSize = "sm" | "md" | "lg" | "xl";
type ButtonColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "link-color"
  | "link-gray"
  | "primary-destructive"
  | "secondary-destructive"
  | "tertiary-destructive"
  | "link-destructive";
type Variant = "primary" | "secondary" | "ghost";
type IconComponent = FC<{ className?: string; "data-icon"?: string }>;

const styles = {
  common: {
    root: [
      "group relative inline-flex h-max w-full cursor-pointer items-center justify-center whitespace-nowrap outline-focus-ring transition duration-100 ease-linear before:absolute data-loading:flex-row-reverse focus:ring-2 focus:ring-focus-ring focus:ring-inset focus:shadow-[var(--shadow-xs),0_0_0_2px_var(--color-bg-primary),0_0_0_4px_var(--color-focus-ring)] focus-visible:outline-0 focus-visible:shadow-[var(--shadow-xs),0_0_0_2px_var(--color-bg-primary),0_0_0_4px_var(--color-focus-ring)]",
      "in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-r-none in-data-input-wrapper:in-data-leading:before:rounded-r-none in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-l-none in-data-input-wrapper:in-data-trailing:before:rounded-l-none",
      "disabled:cursor-not-allowed in-data-input-wrapper:disabled:opacity-100",
      "*:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all",
    ].join(" "),
    icon: "pointer-events-none size-5 shrink-0 transition-inherit-all",
  },
  sizes: {
    sm: {
      root: [
        "gap-1 rounded-lg px-3 py-2 font-semibold before:rounded-[7px] data-icon-only:size-9 data-icon-only:p-2",
        "text-md leading-5",
        "in-data-input-wrapper:px-3.5 in-data-input-wrapper:py-2.5 in-data-input-wrapper:data-icon-only:p-2.5",
      ].join(" "),
      linkRoot: [
        "gap-1 px-3 py-2 text-sm font-medium leading-5",
        "*:data-icon:size-4 *:data-icon:stroke-[2.25px] *:data-text:underline-offset-3",
      ].join(" "),
    },
    md: {
      root: [
        "gap-1 rounded-lg px-3.5 py-2.5 font-semibold before:rounded-[7px] data-icon-only:size-10 data-icon-only:p-2.5",
        "text-md leading-5",
        "in-data-input-wrapper:gap-1.5 in-data-input-wrapper:px-4 in-data-input-wrapper:data-icon-only:p-3",
      ].join(" "),
      linkRoot: [
        "gap-1 px-3.5 py-2.5 text-sm font-medium leading-5",
        "*:data-icon:size-4 *:data-icon:stroke-[2.25px] *:data-text:underline-offset-4",
      ].join(" "),
    },
    lg: {
      root: [
        "gap-1.5 rounded-lg px-4 py-2.5 font-semibold before:rounded-[7px] data-icon-only:size-11 data-icon-only:p-3",
        "text-md leading-5",
      ].join(" "),
      linkRoot: [
        "gap-1.5 px-4 py-2.5 text-md font-medium leading-5",
        "*:data-text:underline-offset-4",
      ].join(" "),
    },
    xl: {
      root: [
        "gap-1.5 rounded-lg px-4.5 py-3 font-semibold before:rounded-[7px] data-icon-only:size-12 data-icon-only:p-3.5",
        "text-md leading-5",
      ].join(" "),
      linkRoot: [
        "gap-1.5 px-4.5 py-3 text-md font-medium leading-5",
        "*:data-text:underline-offset-4",
      ].join(" "),
    },
  },
  colors: {
    primary: {
      root: [
        "bg-brand-solid text-alpha-white shadow-xs-skeuomorphic ring-1 ring-transparent ring-inset hover:bg-brand-solid_hover data-loading:bg-brand-solid",
        "before:absolute before:inset-px before:border before:border-alpha-white-12 before:mask-b-from-0%",
        "disabled:bg-neutral-300 disabled:ring-white disabled:before:hidden disabled:opacity-200",
        "*:data-icon:text-alpha-white/80 hover:*:data-icon:text-alpha-white/80 disabled:*:data-icon:text-white/60",
      ].join(" "),
    },
    secondary: {
      root: [
        "bg-tertiary text-secondary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset hover:bg-primary_hover hover:text-secondary_hover data-loading:bg-tertiary focus:ring-focus-ring focus:shadow-[var(--shadow-xs),0_0_0_2px_var(--color-bg-primary),0_0_0_4px_var(--color-focus-ring)] focus-visible:shadow-[var(--shadow-xs),0_0_0_2px_var(--color-bg-primary),0_0_0_4px_var(--color-focus-ring)]",
        "disabled:bg-neutral-100 disabled:text-quaternary disabled:ring-secondary disabled:before:hidden",
        "*:data-icon:text-fg-secondary hover:*:data-icon:text-fg-secondary_hover disabled:*:data-icon:text-fg-quaternary",
      ].join(" "),
    },
    tertiary: {
      root: [
        "text-blue-500 hover:text-blue-700 data-loading:text-blue-500",
        "focus:ring-0 focus:shadow-none focus-visible:shadow-none focus-visible:*:data-text:underline",
        "disabled:text-neutral-300",
        "*:data-icon:text-blue-500 hover:*:data-icon:text-blue-700 disabled:*:data-icon:text-neutral-300",
      ].join(" "),
    },
    "link-color": {
      root: [
        "justify-normal rounded p-0! text-blue-500 hover:text-blue-700",
        "disabled:text-neutral-300",
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-current focus-visible:*:data-text:decoration-current disabled:*:data-text:decoration-current",
        "*:data-icon:text-blue-500 hover:*:data-icon:text-blue-700 disabled:*:data-icon:text-neutral-300",
      ].join(" "),
    },
    "link-gray": {
      root: [
        "justify-normal rounded p-0! text-tertiary hover:text-tertiary_hover",
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-current",
        "*:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary_hover",
      ].join(" "),
    },
    "primary-destructive": {
      root: [
        "bg-error-solid text-white shadow-xs-skeuomorphic ring-1 ring-transparent outline-error ring-inset hover:bg-error-solid_hover data-loading:bg-error-solid_hover",
        "before:absolute before:inset-px before:border before:border-alpha-white-12 before:mask-b-from-0%",
        "*:data-icon:text-white/60 hover:*:data-icon:text-white/70",
      ].join(" "),
    },
    "secondary-destructive": {
      root: [
        "bg-primary text-error-primary shadow-xs-skeuomorphic ring-1 ring-error_subtle outline-error ring-inset hover:bg-error-primary hover:text-error-primary_hover data-loading:bg-error-primary",
        "*:data-icon:text-fg-error-secondary hover:*:data-icon:text-fg-error-primary",
      ].join(" "),
    },
    "tertiary-destructive": {
      root: [
        "text-error-primary outline-error hover:bg-error-primary hover:text-error-primary_hover data-loading:bg-error-primary",
        "*:data-icon:text-fg-error-secondary hover:*:data-icon:text-fg-error-primary",
      ].join(" "),
    },
    "link-destructive": {
      root: [
        "justify-normal rounded p-0! text-error-primary outline-error hover:text-error-primary_hover",
        "*:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current",
        "*:data-icon:text-fg-error-secondary hover:*:data-icon:text-fg-error-primary",
      ].join(" "),
    },
  },
} as const;

const variantColor: Record<Variant, ButtonColor> = {
  ghost: "tertiary",
  primary: "primary",
  secondary: "secondary",
};

function isReactComponent(component: unknown): component is IconComponent {
  if (typeof component === "function") {
    return true;
  }

  if (typeof component !== "object" || component === null) {
    return false;
  }

  return "$$typeof" in component;
}

export type CommonProps = {
  isDisabled?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  size?: ButtonSize;
  color?: ButtonColor;
  variant?: Variant;
  iconLeading?: IconComponent | ReactNode;
  iconTrailing?: IconComponent | ReactNode;
  noTextPadding?: boolean;
  showTextWhileLoading?: boolean;
  role?: string;
  "aria-checked"?: boolean;
  children?: ReactNode;
  className?: string;
};

export type ButtonProps = CommonProps & Omit<AriaButtonProps, "children" | "className">;

type LinkProps = CommonProps &
  Omit<AriaLinkProps, "children" | "className"> & {
    href: NonNullable<AriaLinkProps["href"]>;
  };

export type Props = ButtonProps | LinkProps;

function getButtonColor(color: ButtonColor | undefined, variant: Variant | undefined) {
  if (color) {
    return color;
  }

  if (variant) {
    return variantColor[variant];
  }

  return "primary";
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
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  isDisabled,
  disabled,
  isLoading: loading,
  showTextWhileLoading,
  ...props
}) => {
  const href = "href" in props ? props.href : undefined;
  const resolvedColor = getButtonColor(color, variant);
  const hasChildren = Boolean(children);
  const isLoading = Boolean(loading);
  const isIcon = Boolean(!hasChildren && (IconLeading || IconTrailing || isLoading));
  const isLinkType = ["link-gray", "link-color", "link-destructive", "tertiary"].includes(
    resolvedColor,
  );
  const shouldDisable = Boolean(isDisabled || disabled);
  const shouldRemoveTextPadding = isLinkType || noTextPadding;

  const commonChildren = (
    <>
      {isValidElement(IconLeading) && IconLeading}
      {isReactComponent(IconLeading) && (
        <IconLeading className={styles.common.icon} data-icon="leading" />
      )}

      {isLoading && (
        <svg
          aria-hidden="true"
          fill="none"
          data-icon="loading"
          focusable="false"
          viewBox="0 0 20 20"
          className={cx(
            styles.common.icon,
            !showTextWhileLoading &&
              !isIcon &&
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          )}
        >
          <circle className="stroke-current opacity-30" cx="10" cy="10" r="8" strokeWidth="2" />
          <circle
            className="origin-center animate-spin stroke-current"
            cx="10"
            cy="10"
            r="8"
            strokeDasharray="12.5 50"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      )}

      {hasChildren && (
        <span
          data-text
          className={cx("transition-inherit-all", !shouldRemoveTextPadding && "px-0.5")}
        >
          {children}
        </span>
      )}

      {isValidElement(IconTrailing) && IconTrailing}
      {isReactComponent(IconTrailing) && (
        <IconTrailing className={styles.common.icon} data-icon="trailing" />
      )}
    </>
  );

  const commonClassName = cx(
    styles.common.root,
    styles.sizes[size].root,
    styles.colors[resolvedColor].root,
    isLinkType && styles.sizes[size].linkRoot,
    (isLoading || (href && (shouldDisable || isLoading))) && "pointer-events-none",
    isLoading &&
      (showTextWhileLoading
        ? "[&>*:not([data-icon=loading]):not([data-text])]:hidden"
        : "[&>*:not([data-icon=loading])]:invisible"),
    className,
  );

  if ("href" in props) {
    return (
      <AriaLink
        {...props}
        className={commonClassName}
        data-icon-only={isIcon ? true : undefined}
        data-loading={isLoading ? true : undefined}
        href={shouldDisable ? undefined : href}
      >
        {commonChildren}
      </AriaLink>
    );
  }

  return (
    <AriaButton
      {...props}
      className={commonClassName}
      data-icon-only={isIcon ? true : undefined}
      data-loading={isLoading ? true : undefined}
      isDisabled={shouldDisable}
      isPending={isLoading}
      type={props.type || "button"}
    >
      {commonChildren}
    </AriaButton>
  );
};

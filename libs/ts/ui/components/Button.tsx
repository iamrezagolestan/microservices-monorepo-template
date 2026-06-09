"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import { cloneElement, isValidElement } from "react";
import type {
  ButtonProps as AriaButtonProps,
  LinkProps as AriaLinkProps,
} from "react-aria-components";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { cn } from "../cn";

type ButtonIcon = ComponentType<SVGProps<SVGSVGElement>> | ReactNode;

type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
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

const styles = {
  common: {
    root: [
      "group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap outline-[#4C89FA] transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2",
      "disabled:cursor-not-allowed",
      "*:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all",
    ].join(" "),
    icon: "pointer-events-none size-5 shrink-0 transition-inherit-all",
  },
  sizes: {
    xs: {
      root: "h-9 gap-2 rounded-lg px-3 text-sm font-semibold before:rounded-[7px] data-icon-only:size-9 data-icon-only:p-0",
      linkRoot: "gap-1 *:data-text:underline-offset-3",
    },
    sm: {
      root: "h-10 gap-2 rounded-lg px-3.5 text-sm font-semibold before:rounded-[7px] data-icon-only:size-10 data-icon-only:p-0",
      linkRoot: "gap-1 *:data-text:underline-offset-3",
    },
    md: {
      root: "h-10 gap-2 rounded-lg px-4 text-md font-semibold before:rounded-[7px] data-icon-only:size-11 data-icon-only:p-0",
      linkRoot: "gap-1 *:data-text:underline-offset-4",
    },
    lg: {
      root: "h-11 gap-2 rounded-lg px-4.5 text-md font-semibold before:rounded-[7px] data-icon-only:size-12 data-icon-only:p-0",
      linkRoot: "gap-1.5 *:data-text:underline-offset-4",
    },
    xl: {
      root: "h-12 gap-2 rounded-lg px-5 text-lg font-semibold before:rounded-[7px] data-icon-only:size-12 data-icon-only:p-0",
      linkRoot: "gap-1.5 *:data-text:underline-offset-4",
    },
  },
  colors: {
    primary: {
      root: [
        "bg-[#151515] text-white shadow-xs-skeuomorphic ring-1 ring-transparent ring-inset hover:bg-[#4D4D4D] pressed:bg-[#151515] disabled:bg-[#B3B3B3] data-loading:bg-[#151515]",
        "before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
        "*:data-icon:text-white hover:*:data-icon:text-white pressed:*:data-icon:text-white disabled:*:data-icon:text-[#D5D7DA]",
      ].join(" "),
    },
    secondary: {
      root: [
        "bg-white text-[#333333] shadow-xs-skeuomorphic ring-1 ring-[#CCCCCC] ring-inset hover:bg-[#EDEDED] hover:text-[#151515] pressed:bg-white pressed:text-[#414651] pressed:ring-[#D5D7DA] disabled:bg-[#E6E6E6] disabled:text-[#D5D7DA] disabled:ring-[#E9EAEB] data-loading:bg-white",
        "*:data-icon:text-[#51525A] hover:*:data-icon:text-[#717680] pressed:*:data-icon:text-[#A4A7AE] disabled:*:data-icon:text-[#D5D7DA]",
      ].join(" "),
    },
    tertiary: {
      root: [
        "text-[#333333] hover:bg-[#EDEDED] hover:text-[#151515] pressed:text-[#414651] disabled:text-[#B3B3B3] data-loading:text-[#333333]",
        "*:data-icon:text-[#51525A] hover:*:data-icon:text-[#717680] pressed:*:data-icon:text-[#A4A7AE] disabled:*:data-icon:text-[#B3B3B3]",
      ].join(" "),
    },
    "link-color": {
      root: [
        "h-auto justify-normal rounded p-0! text-[#4C89FA] hover:text-[#26447D] pressed:text-[#26447D] disabled:text-[#B3B3B3]",
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-current",
        "*:data-icon:text-[#4C89FA] hover:*:data-icon:text-[#26447D] pressed:*:data-icon:text-[#26447D] disabled:*:data-icon:text-[#B3B3B3]",
      ].join(" "),
    },
    "link-gray": {
      root: [
        "h-auto justify-normal rounded p-0! text-[#333333] hover:text-[#151515] pressed:text-[#414651] disabled:text-[#B3B3B3]",
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-current",
        "*:data-icon:text-[#51525A] hover:*:data-icon:text-[#717680] pressed:*:data-icon:text-[#A4A7AE] disabled:*:data-icon:text-[#B3B3B3]",
      ].join(" "),
    },
    "primary-destructive": {
      root: [
        "bg-[#151515] text-white shadow-xs-skeuomorphic ring-1 ring-transparent ring-inset hover:bg-[#4D4D4D] pressed:bg-[#151515] disabled:bg-[#B3B3B3] data-loading:bg-[#151515]",
        "before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
        "*:data-icon:text-white hover:*:data-icon:text-white pressed:*:data-icon:text-white disabled:*:data-icon:text-[#D5D7DA]",
      ].join(" "),
    },
    "secondary-destructive": {
      root: [
        "bg-white text-[#333333] shadow-xs-skeuomorphic ring-1 ring-[#CCCCCC] ring-inset hover:bg-[#EDEDED] hover:text-[#151515] pressed:bg-white pressed:text-[#414651] pressed:ring-[#D5D7DA] disabled:bg-[#E6E6E6] disabled:text-[#D5D7DA] disabled:ring-[#E9EAEB] data-loading:bg-white",
        "*:data-icon:text-[#51525A] hover:*:data-icon:text-[#717680] pressed:*:data-icon:text-[#A4A7AE] disabled:*:data-icon:text-[#D5D7DA]",
      ].join(" "),
    },
    "tertiary-destructive": {
      root: [
        "text-[#333333] hover:bg-[#EDEDED] hover:text-[#151515] pressed:text-[#414651] disabled:text-[#B3B3B3] data-loading:text-[#333333]",
        "*:data-icon:text-[#51525A] hover:*:data-icon:text-[#717680] pressed:*:data-icon:text-[#A4A7AE] disabled:*:data-icon:text-[#B3B3B3]",
      ].join(" "),
    },
    "link-destructive": {
      root: [
        "h-auto justify-normal rounded p-0! text-[#4C89FA] hover:text-[#26447D] pressed:text-[#26447D] disabled:text-[#B3B3B3]",
        "*:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current",
        "*:data-icon:text-[#4C89FA] hover:*:data-icon:text-[#26447D] pressed:*:data-icon:text-[#26447D] disabled:*:data-icon:text-[#B3B3B3]",
      ].join(" "),
    },
  },
} as const;

export interface CommonProps {
  isDisabled?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  size?: ButtonSize;
  color?: ButtonColor;
  iconLeading?: ButtonIcon;
  iconTrailing?: ButtonIcon;
  noTextPadding?: boolean;
  showTextWhileLoading?: boolean;
}

export interface ButtonProps
  extends CommonProps,
    Omit<AriaButtonProps, "children" | "className" | "isDisabled" | "isPending"> {
  children?: ReactNode;
  className?: string;
}

interface LinkProps
  extends CommonProps,
    Omit<AriaLinkProps, "children" | "className" | "isDisabled"> {
  children?: ReactNode;
  className?: string;
}

export type Props = ButtonProps | LinkProps;

function isReactComponent(value: ButtonIcon): value is ComponentType<SVGProps<SVGSVGElement>> {
  return typeof value === "function";
}

function renderIcon(icon: ButtonIcon | undefined, className: string) {
  if (!icon) {
    return null;
  }

  if (isValidElement<{ className?: string; "data-icon"?: string }>(icon)) {
    return cloneElement(icon, {
      "data-icon": "true",
      className: cn(className, icon.props.className),
    });
  }

  if (isReactComponent(icon)) {
    const Icon = icon;
    return <Icon data-icon="true" className={className} />;
  }

  return icon;
}

export function Button({
  size = "sm",
  color = "primary",
  children,
  className,
  disabled,
  noTextPadding,
  iconLeading,
  iconTrailing,
  isDisabled,
  isLoading,
  showTextWhileLoading,
  ...otherProps
}: Props) {
  const href = "href" in otherProps ? otherProps.href : undefined;
  const buttonDisabled = isDisabled || disabled;
  const isIconOnly = (iconLeading || iconTrailing) && !children;
  const isLinkType = color === "link-gray" || color === "link-color" || color === "link-destructive";
  const hasTextPadding = !(isLinkType || noTextPadding);
  const rootClassName = cn(
    styles.common.root,
    styles.sizes[size].root,
    styles.sizes[size].linkRoot,
    styles.colors[color].root,
    isLoading && (showTextWhileLoading ? "[&>*:not([data-icon=loading])]:opacity-0" : "[&>[data-text=true]]:opacity-0"),
    className,
  );
  const content = (
    <>
      {renderIcon(iconLeading, styles.common.icon)}
      {isLoading && (
        <span
          aria-hidden="true"
          data-icon="loading"
          className={cn(
            styles.common.icon,
            "absolute animate-spin rounded-full border-2 border-current border-t-transparent",
          )}
        />
      )}
      {children && (
        <span data-text="true" className={cn(hasTextPadding && "px-0.5")}>
          {children}
        </span>
      )}
      {renderIcon(iconTrailing, styles.common.icon)}
    </>
  );

  if (href) {
    const linkProps = otherProps as LinkProps;

    return (
      <AriaLink
        {...linkProps}
        href={buttonDisabled ? undefined : href}
        isDisabled={buttonDisabled || isLoading}
        data-loading={isLoading ? true : undefined}
        data-icon-only={isIconOnly ? true : undefined}
        className={rootClassName}
      >
        {content}
      </AriaLink>
    );
  }

  const buttonProps = otherProps as ButtonProps;

  return (
    <AriaButton
      {...buttonProps}
      type={buttonProps.type || "button"}
      isPending={isLoading}
      isDisabled={buttonDisabled || isLoading}
      data-loading={isLoading ? true : undefined}
      data-icon-only={isIconOnly ? true : undefined}
      className={rootClassName}
    >
      {content}
    </AriaButton>
  );
}

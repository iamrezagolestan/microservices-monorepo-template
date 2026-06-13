import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg" | "xl";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  variant?: Variant;
  color?: Variant;
  size?: Size;
  iconLeading?: ReactNode;
  iconTrailing?: ReactNode;
  iconOnly?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 py-2 text-sm leading-5",
  md: "min-h-10 px-3.5 py-2.5 text-base leading-5",
  lg: "min-h-10 px-[18px] py-2.5 text-base leading-5",
  xl: "min-h-11 px-5 py-3 text-base leading-5",
};

const loadingSizes: Record<Size, string> = {
  sm: "min-h-9 px-3 py-2 text-base leading-5",
  md: "min-h-10 px-3.5 py-2.5 text-base leading-5",
  lg: "min-h-11 px-[18px] py-3 text-base leading-5",
  xl: "min-h-12 px-5 py-3.5 text-base leading-5",
};

const iconOnlySizes: Record<Size, string> = {
  sm: "size-9 p-0",
  md: "size-10 p-0",
  lg: "size-11 p-0",
  xl: "size-12 p-0",
};

const variants: Record<Variant, string> = {
  primary:
    "border-2 border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-bg-hover)]",
  secondary:
    "border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-fg)] hover:border-[var(--button-secondary-border-hover)] hover:bg-[var(--button-secondary-bg-hover)] hover:text-[var(--button-secondary-fg-hover)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--button-text-fg)] shadow-none hover:text-[var(--button-text-fg-hover)]",
};

function LoadingIcon() {
  return (
    <span
      aria-hidden="true"
      className="size-5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent opacity-80"
    />
  );
}

export function Button({
  children,
  className,
  color,
  disabled,
  fullWidth = false,
  iconLeading,
  iconOnly = false,
  iconTrailing,
  isDisabled,
  isLoading = false,
  loadingText,
  size = "md",
  variant = "primary",
  ...rest
}: Props) {
  const resolvedVariant = color ?? variant;
  const isButtonDisabled = disabled || isDisabled || isLoading;
  const label = isLoading && loadingText ? loadingText : children;
  const iconClass = resolvedVariant === "ghost" ? "[&>svg]:size-4" : "[&>svg]:size-5";
  const weightClass = resolvedVariant === "ghost" ? "font-medium" : "font-semibold";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-md tracking-normal shadow-[var(--shadow-xs),var(--shadow-skeuomorphic)]",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus-inner)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--button-focus-outer)]",
        "disabled:pointer-events-none",
        fullWidth && "w-full",
        iconOnly ? iconOnlySizes[size] : isLoading ? loadingSizes[size] : sizes[size],
        variants[resolvedVariant],
        iconClass,
        weightClass,
        resolvedVariant === "ghost" &&
          "focus-visible:underline focus-visible:ring-0 focus-visible:ring-offset-0 disabled:underline",
        isButtonDisabled &&
          (resolvedVariant === "primary"
            ? "border-white bg-[var(--button-primary-bg-disabled)] text-[var(--button-primary-fg)]"
            : resolvedVariant === "secondary"
              ? "border-[var(--button-secondary-border-disabled)] bg-[var(--button-secondary-bg-disabled)] text-[var(--button-secondary-fg-disabled)]"
              : "text-[var(--button-text-fg-disabled)]"),
        className,
      )}
      disabled={isButtonDisabled}
      {...rest}
    >
      {isLoading ? <LoadingIcon /> : iconLeading}
      {iconOnly ? <span className="sr-only">{label}</span> : label}
      {!iconOnly && !isLoading ? iconTrailing : null}
    </button>
  );
}

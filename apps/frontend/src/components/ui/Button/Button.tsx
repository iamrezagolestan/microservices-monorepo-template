import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary: "bg-brand-solid text-primary hover:bg-brand-solid_hover",
  secondary: "bg-tertiary text-primary hover:bg-quaternary",
  ghost: "bg-transparent text-primary hover:bg-tertiary",
};

export function Button({ className, variant = "primary", ...rest }: Props) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
        "transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}

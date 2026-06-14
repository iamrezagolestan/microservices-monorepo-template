import { type InputHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "../cn";

type InputState = "default" | "filled" | "focused" | "disabled";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  helperText?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  controlClassName?: string;
  inputClassName?: string;
  leadingIconClassName?: string;
  requiredIndicator?: boolean;
  state?: InputState;
  trailingIconClassName?: string;
  dataTestid: string
};

const stateClasses: Record<InputState, string> = {
  default:
    "border border-[var(--input-border)] text-[var(--input-fg-placeholder)] shadow-[var(--shadow-xs)]",
  filled: "border border-[var(--input-border)] text-[var(--input-fg)] shadow-[var(--shadow-xs)]",
  focused:
    "border-2 border-[var(--input-border-focus)] text-[var(--input-fg)] shadow-[var(--shadow-xs)]",
  disabled:
    "border border-[var(--input-border)] text-[var(--input-fg-disabled)] shadow-[var(--shadow-xs)]",
};

export function Input({
  className,
  controlClassName,
  disabled,
  helperText,
  id,
  inputClassName,
  label,
  leadingIcon,
  leadingIconClassName,
  placeholder,
  required,
  requiredIndicator,
  state = "default",
  trailingIcon,
  trailingIconClassName,
  dataTestid,
  ...rest
}: Props) {
  const generatedId = useId();
  const inputId = id ?? rest.name ?? generatedId;
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
  const isDisabled = disabled || state === "disabled";
  const showsChrome = state !== "filled";

  return (
    <div className={cn("flex w-80 flex-col items-end gap-1.5", className)} data-testid={dataTestid}>
      {label ? (
        <label
          htmlFor={inputId}
          className="flex items-start justify-end gap-0.5 text-right text-sm font-medium leading-5 tracking-normal text-[var(--input-label-fg)]"
        >
          {(required || requiredIndicator) && (
            <span className="text-[var(--input-required-fg)]" aria-hidden="true">
              *
            </span>
          )}
          <span>{label}</span>
        </label>
      ) : null}

      <div
        className={cn(
          "flex h-10 w-full items-center justify-end gap-2 rounded-md bg-[var(--input-bg)] px-3 py-2",
          stateClasses[state],
          controlClassName,
        )}
        dir="rtl"
      >
        {showsChrome && leadingIcon ? (
          <span className={cn("size-5 shrink-0 text-[var(--input-icon-fg)]", leadingIconClassName)}>
            {leadingIcon}
          </span>
        ) : null}

        <input
          id={inputId}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-right text-base font-normal leading-6 tracking-normal outline-none placeholder:text-[var(--input-fg-placeholder)] disabled:text-[var(--input-fg-disabled)] disabled:placeholder:text-[var(--input-fg-disabled)]",
            state === "focused" || state === "filled"
              ? "text-[var(--input-fg)]"
              : state === "disabled"
                ? "text-[var(--input-fg-disabled)]"
                : "text-[var(--input-fg-placeholder)]",
            inputClassName,
          )}
          aria-describedby={helperId}
          disabled={isDisabled}
          placeholder={placeholder}
          required={required}
          {...rest}
        />

        {showsChrome && trailingIcon ? (
          <span
            className={cn("size-4 shrink-0 text-[var(--input-icon-fg)]", trailingIconClassName)}
          >
            {trailingIcon}
          </span>
        ) : null}
      </div>

      {showsChrome && helperText ? (
        <p
          id={helperId}
          className="w-full text-right text-sm font-normal leading-5 tracking-normal text-[var(--input-helper-fg)]"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

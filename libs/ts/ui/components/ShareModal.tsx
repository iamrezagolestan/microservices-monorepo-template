import { Copy, Mail, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../cn";
import { Button } from "./Button";
import { Input } from "./Input";

type Props = {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  linkLabel?: string;
  linkValue?: string;
  closeLabel?: string;
  copyLinkLabel?: string;
  cancelLabel?: string;
  confirmLabel?: string;
};

const modalBackdrop = "bg-[var(--color-gray-70)]";
const modalSurface = "bg-[var(--color-gray-0)] shadow-[var(--shadow-xl)]";
const modalTextPrimary = "text-[var(--color-gray-80)]";
const modalTextSecondary = "text-[var(--color-gray-60)]";
const modalBorder = "border-[var(--color-stroke-primary)]";
const modalIconHover = "hover:bg-[var(--color-gray-100)]";
const modalButtonBase = "shadow-none focus-visible:no-underline [&>svg]:shrink-0 [&>svg]:size-6";
const modalCopyButtonBase = "shadow-none focus-visible:no-underline [&>svg]:size-5";

export function ShareModal({
  cancelLabel = "خروج",
  className,
  closeLabel = "بستن",
  confirmLabel = "کپی لینک",
  copyLinkLabel = "کپی لینک",
  description = "میتوانید چت خود را با هوش مصنوعی به اشتراک بگذارید",
  linkLabel = "لینک",
  linkValue = "olivia@untitledui.com",
  title = "اشتراک گذاری",
}: Props) {
  return (
    <div
      className={cn(
        "flex min-h-[365px] items-center justify-center px-8 py-8",
        modalBackdrop,
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full max-w-[400px] overflow-hidden rounded-[var(--radius-2xl)]",
          modalSurface,
        )}
      >
        <Button
          aria-label={closeLabel}
          iconOnly
          size="lg"
          variant="ghost"
          className={cn(
            "absolute left-3 top-3 text-[var(--color-gray-70)]",
            modalIconHover,
            modalButtonBase,
          )}
        >
          <X aria-hidden="true" />
        </Button>

        <div className="flex flex-col items-center pt-4">
          <div className="flex w-full flex-col gap-4 px-6 pt-6 text-right">
            <p
              className={cn(
                "w-full text-right text-[16px] font-semibold leading-6",
                modalTextPrimary,
              )}
            >
              {title}
            </p>
            <p className={cn("w-full text-right text-sm leading-5", modalTextSecondary)}>
              {description}
            </p>
          </div>
          <div className="h-5 w-full" />
        </div>

        <div className="flex flex-col gap-4 px-6">
          <div className="flex items-end justify-end gap-1">
            <Button
              aria-label={copyLinkLabel}
              iconOnly
              size="md"
              variant="ghost"
              className={cn("text-[var(--color-gray-70)]", modalIconHover, modalCopyButtonBase)}
            >
              <Copy aria-hidden="true" />
            </Button>

            <Input
              label={linkLabel}
              leadingIcon={<Mail aria-hidden="true" className="size-full" />}
              placeholder={linkValue}
              className="w-[320px]"
            />
          </div>
        </div>

        <div className={cn("mt-8 border-t pt-8", modalBorder)}>
          <div className="flex gap-3 px-6 pb-6">
            <Button fullWidth size="lg" variant="secondary" className="min-h-11 px-4 py-[10px]">
              {cancelLabel}
            </Button>
            <Button fullWidth size="lg" variant="primary" className="min-h-11 px-4 py-[10px]">
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

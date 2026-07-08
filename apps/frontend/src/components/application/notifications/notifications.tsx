"use client";

import { AlertCircle, XClose } from "@untitledui/icons";
import type { CSSProperties, ReactNode } from "react";
import { Toaster, toast } from "sonner";
import { cx } from "@/utils/cx";

const usageLimitToastId = "usage-limit-notification";

type NotificationProps = {
  id: string | number;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

type ShowNotificationOptions = {
  title: ReactNode;
  description?: ReactNode;
  id?: string | number;
};

type UsageLimitNotificationProps = {
  id: string | number;
  className?: string;
};

const notificationToasterStyle = {
  "--width": "min(calc(100vw - 32px), 748px)",
} as CSSProperties;

export function NotificationToaster() {
  return (
    <Toaster
      duration={5000}
      expand
      className="notification-toaster"
      offset={16}
      position="top-center"
      style={notificationToasterStyle}
      toastOptions={{ className: "w-full", unstyled: true }}
      visibleToasts={3}
    />
  );
}

export function showNotification({
  title,
  description,
  id = usageLimitToastId,
}: ShowNotificationOptions) {
  toast.custom(
    (toastId) => <Notification description={description} id={toastId} title={title} />,
    {
      id,
      className: "w-full",
      position: "top-center",
      unstyled: true,
    },
  );
}

export function showUsageLimitNotification() {
  showNotification({
    id: usageLimitToastId,
    title: "شما به محدودیت استفاده رسیدید",
    description: "برای استفاده مجدد تا فردا صبر کنید",
  });
}

export function Notification({ id, title, description, className }: NotificationProps) {
  return (
    <div
      className={cx(
        "relative flex w-full items-start justify-end gap-4 rounded-xl border border-primary bg-primary_hover p-4 text-right shadow-xs",
        className,
      )}
      data-testid="usage-limit-notification"
      role="status"
    >
      <button
        aria-label="Close notification"
        className="absolute top-2 left-2 z-10 flex size-9 items-center justify-center rounded-md text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary hover:text-fg-tertiary focus:ring-2 focus:ring-focus-ring"
        onClick={() => toast.dismiss(id)}
        type="button"
      >
        <XClose className="size-5" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col items-end gap-3">
        <div className="flex w-full flex-col items-end gap-1">
          <div className="flex w-full items-start justify-end pr-0 pl-8">
            <p className="min-w-0 flex-1 text-md font-semibold text-primary">{title}</p>
          </div>
          {description && <p className="w-full text-sm font-regular text-secondary">{description}</p>}
        </div>
      </div>

      <div className="pointer-events-none relative size-5 shrink-0 rounded-full text-fg-error-primary">
        {/* <div className="absolute -inset-1 rounded-full border-2 border-current opacity-30" /> */}
        {/* <div className="absolute -inset-2.5 rounded-full border-2 border-current opacity-10" /> */}
        {/* <AlertCircle className="relative size-5" /> */}
      </div>
    </div>
  );
}

export function UsageLimitNotification({ id, className }: UsageLimitNotificationProps) {
  return (
    <Notification
      className={className}
      description="برای استفاده مجدد تا فردا صبر کنید"
      id={id}
      title="شما به محدودیت استفاده رسیدید"
    />
  );
}

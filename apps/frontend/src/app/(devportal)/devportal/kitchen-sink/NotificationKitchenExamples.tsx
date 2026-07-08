"use client";

import { Button } from "@/components/base/button/button";
import {
  NotificationToaster,
  showUsageLimitNotification,
} from "@/components/application/notifications/notifications";

export function NotificationKitchenExamples() {
  return (
    <>
      <Button color="secondary" onPress={showUsageLimitNotification} size="md">
        Show notification
      </Button>
      <NotificationToaster />
    </>
  );
}

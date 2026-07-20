"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type MswProviderProps = {
  children: ReactNode;
};

export function MswProvider({ children }: MswProviderProps) {
  const [ready, setReady] = useState(process.env.NEXT_PUBLIC_MSW_ENABLED !== "true");

  useEffect(() => {
    const isLocalFrontend =
      window.location.protocol === "http:" && window.location.hostname === "localhost";

    if (process.env.NEXT_PUBLIC_MSW_ENABLED !== "true" || !isLocalFrontend) {
      setReady(true);
      return;
    }

    async function enableMocking() {
      const { worker } = await import("@/mocks/browser");

      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      });

      setReady(true);
    }

    enableMocking().catch(() => setReady(true));
  }, []);

  if (!ready) {
    return null;
  }

  return children;
}

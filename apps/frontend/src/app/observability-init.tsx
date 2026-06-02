"use client";

import { initBrowserObservability } from "@observability/client";
import { useEffect } from "react";

export function ObservabilityInit() {
  useEffect(() => {
    initBrowserObservability();
  }, []);
  return null;
}

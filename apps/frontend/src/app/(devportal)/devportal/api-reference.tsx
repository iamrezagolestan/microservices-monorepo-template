"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
// Scalar ships its stylesheet as a separate export; the JS wrapper does not import
// it, so without this the reference renders unstyled. Bundled by Next → served
// same-origin (style-src 'self'), no CDN.
import "@scalar/api-reference-react/style.css";
import { devportalSources } from "@/devportal/specs";

// Scalar mounts a Vue app into a ref on the client (ADR-0009/0014). It renders the
// internal projection — every service's full spec, incl. x-internal ops — served
// same-origin under the /devportal session gate; "try it" hits the real edge.
export function ApiReference() {
  return (
    <ApiReferenceReact
      configuration={{
        sources: [...devportalSources],
        // No CDN: self-host fonts so the bundle stays offline-clean and CSP-safe
        // (font-src 'self', ADR-0014). Scalar's own theme is a deliberate island.
        withDefaultFonts: false,
      }}
    />
  );
}

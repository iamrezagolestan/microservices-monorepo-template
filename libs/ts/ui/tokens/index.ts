// Untitled UI token bridge (ADR-0014). Ports of the upstream Tailwind preset
// live here as committed source; see ./UPSTREAM.md for the tracked version.
//
// Real token wiring lives in apps/frontend/src/styles/globals.css via the
// Tailwind v4 `@theme` block. This file exports the same tokens to TS code
// that needs them outside CSS (chart palettes, inline SVG fills, etc.).

export const tokens = {
  color: {
    brand: {
      50: "#eef4ff",
      100: "#dbe6ff",
      200: "#bfceff",
      300: "#84adff",
      400: "#528bff",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
  },
  radius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
  },
} as const;

// Untitled UI token mirror (ADR-0014). CSS is the runtime source of truth in
// src/styles/theme.css; this file exposes the same project-preserved values to
// TypeScript consumers that need tokens outside Tailwind classes.

export const tokens = {
  color: {
    brand: {
      50: "#eef4ff",
      100: "#dbe6ff",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      900: "#1e3a8a",
    },
    text: {
      primary: "#0f172a",
      tertiary: "#475569",
      quaternary: "#64748b",
      errorPrimary: "#dc2626",
      white: "#ffffff",
      brandTertiary: "#2563eb",
    },
    border: {
      primary: "#cbd5e1",
      secondary: "#e2e8f0",
    },
    background: {
      primary: "#ffffff",
      tertiary: "#f1f5f9",
      quaternary: "#e2e8f0",
      brandSolid: "#2563eb",
      brandSolidHover: "#1d4ed8",
    },
    input: {
      surface: "#ffffff",
      label: "#4d4d4d",
      required: "#701a15",
      border: "#cccccc",
      focus: "#151515",
      icon: "#999999",
      placeholder: "#999999",
      value: "#1a1a1a",
      disabled: "#808080",
      hint: "#808080",
    },
  },
  radius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
  },
} as const;

# Untitled UI upstream tracking

This directory holds ports of Untitled UI primitives; the matching design tokens live in `src/styles/theme.css` and are mirrored in `src/lib/tokens.ts`. Per ADR-0014, the ports are committed source â€” not runtime-fetched.

| Tracked      | Version | Synced on      |
|--------------|---------|----------------|
| Untitled UI  | â€”       | not yet synced |
| lucide-react | 0.469.0 | 2026-05-20     |

Annual bump cadence. To re-sync:

1. Pull the latest Untitled UI Tailwind preset and primitive sources.
2. Diff against `src/components/ui/`, `src/styles/theme.css`, `src/styles/typography.css`, and `src/lib/tokens.ts`.
3. Open a PR titled `feat(frontend): bump Untitled UI to <version>`.
4. Update the table above and the date.

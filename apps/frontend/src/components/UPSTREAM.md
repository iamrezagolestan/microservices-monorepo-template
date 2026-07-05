# Untitled UI upstream tracking

This tree holds Untitled UI React ports as committed source (ADR-0014) — not
runtime-fetched. Untitled UI ships source you own, built on
[React Aria Components](https://react-spectrum.adobe.com/react-aria/); the files
below are vendored verbatim from upstream and mirror its layout:

| Path                         | Upstream                          |
|------------------------------|-----------------------------------|
| `components/base/*`          | `components/base/*`               |
| `components/application/*`   | `components/application/*`        |
| `components/foundations/*`   | `components/foundations/*`        |
| `src/styles/theme.css`       | `styles/theme.css` (design tokens)|
| `src/styles/typography.css`  | `styles/typography.css`           |
| `src/styles/globals.css`     | `styles/globals.css`              |
| `src/utils/cx.ts`            | `utils/cx.ts`                     |
| `src/utils/is-react-component.ts` | `utils/is-react-component.ts` |

| Tracked                            | Version | Synced on  |
|------------------------------------|---------|------------|
| Untitled UI React (source)         | main    | 2026-05-20 |
| react-aria-components              | 1.19.0  | 2026-05-20 |
| @untitledui/icons                  | 0.0.22  | 2026-05-20 |
| tailwindcss-react-aria-components  | 2.2.0   | 2026-05-20 |
| tailwindcss-animate                | 1.0.7   | 2026-05-20 |

Annual bump cadence. To re-sync:

1. Add/update components with the Untitled UI CLI (`npx untitledui@latest add <component>`)
   or copy from the upstream repo, keeping the `base|application|foundations` layout.
2. Diff `src/styles/theme.css`, `typography.css`, `globals.css`, and `src/utils/`
   against upstream.
3. Open a PR titled `feat(frontend): bump Untitled UI to <version>`.
4. Update the tables above and the dates.

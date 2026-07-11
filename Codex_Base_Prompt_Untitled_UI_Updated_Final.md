# Codex Base Prompt --- Untitled UI + Tailwind v4 + Figma MCP

## Before writing any code

Read **ADR-0014** carefully and follow every frontend architecture
decision defined there.

Inspect the existing project structure before making any changes.

Inspect the existing UI library, especially every Untitled UI-based
component that already exists in the project.

If the requested component already exists as an official Untitled UI
component, reuse that implementation directly.

If the component does not exist, install it first using the official
Untitled UI CLI.

Example:

``` bash
bunx untitledui@latest add input
bunx untitledui@latest add button
bunx untitledui@latest add textarea
bunx untitledui@latest add select
```

The official Untitled UI implementation must remain the foundation and
single source of truth.

Never:

-   recreate the component
-   build a similar implementation
-   create wrappers that replace the original architecture
-   replace Untitled UI with a custom implementation

Only extend, configure and minimally modify the original component.

------------------------------------------------------------------------

# Task

Implement the component shown in this Figma design using the existing
project architecture and the official Untitled UI component.

**Figma**

`https://www.figma.com/design/o9CefpzCPRgy0XBO1Yxo2X/Uniprompt--UI?node-id=1306-8385&m=dev`


The implementation must be visually indistinguishable from the Figma.

Pay extremely close attention to typography, font family, font size,
font weight, line height, spacing, padding, margins, borders, border
radius, shadows, colors, sizing, width, height, icon sizes, icon spacing
and every visual state.

Pixel-level accuracy is required.

------------------------------------------------------------------------



## Existing Component API (Mandatory)

Whenever you use existing components, you must have a complete understanding of their available variants, props, composition patterns and intended usage before making any changes.

Always inspect the component implementation and its API first.

- Use every existing variant and prop correctly whenever applicable.
- Do not introduce additional props if an existing one already solves the problem.
- Do not ignore existing capabilities of the component.
- Do not reimplement functionality that already exists.
- Extend the existing API only when it is absolutely necessary and cannot be achieved through the current implementation.
- Preserve API consistency across the entire design system.

# Component architecture

Preserve the existing project architecture.

Prefer extending the existing component instead of rewriting it.

Only make the minimum amount of code changes required.

Do not refactor unrelated code.

Do not modify unrelated components.

Do not introduce unnecessary abstractions.

Do not use nested ternary expressions.

Prefer helper functions, mappings, variables and readable conditional
logic.

------------------------------------------------------------------------

# Design token architecture

Inspect the existing:

-   design tokens
-   theme
-   typography tokens
-   spacing tokens
-   radius tokens
-   sizing tokens
-   elevation tokens
-   color tokens

Reuse existing tokens whenever possible.

If a required token does not exist:

-   add it correctly to the project's design token system
-   avoid duplicate or equivalent tokens

Never hardcode colors, spacing, typography, radius, shadows, sizing or
elevations whenever a token already exists.

------------------------------------------------------------------------

# Theme architecture (Mandatory)

Follow the official Untitled UI theme architecture.

Always consume colors through the project's design tokens.

Reusable components must remain completely theme-agnostic.

Never duplicate Light/Dark colors inside components.

Never implement custom dark-mode logic.

The theme remains the single source of truth.

------------------------------------------------------------------------

# Design Token Consumption (Mandatory)

## Existing tokens always have priority

Before creating any new token:

1.  Inspect `theme.css`
2.  Search for an existing semantic token.
3.  Reuse it.

Creating new tokens must always be the last resort.

------------------------------------------------------------------------

## Never create component-specific tokens

Never create tokens such as:

``` css
--color-button-primary
--color-button-secondary
--color-button-focus
--input-border
--textarea-background
--button-radius
```

or similar.

Correct architecture:

Base Tokens

↓

Semantic Tokens

↓

Tailwind Theme Utilities

↓

Components

Never introduce:

Base Tokens

↓

Semantic Tokens

↓

Component Tokens

↓

Components

------------------------------------------------------------------------

## Preserve Untitled UI naming

If an existing Untitled UI token already represents the same semantic
meaning as a Figma variable:

Reuse the existing Untitled UI token.

Only replace the value.

Never rename the design system.

------------------------------------------------------------------------

## Never duplicate values

Do not duplicate colors, spacing, radius, typography or shadows under
another name.

Always reuse existing semantic tokens.

------------------------------------------------------------------------

## Tailwind v4 Theme Consumption

This project uses Tailwind CSS v4 with `@theme`.

Whenever a token is exposed through `@theme`, use the generated Tailwind
utility.

Prefer:

``` tsx
bg-brand-500
bg-bg-primary
text-fg-primary
border-border-primary

rounded-md
rounded-lg

text-sm
text-md

leading-sm
leading-md

p-3
px-4
py-2

gap-2
gap-3

w-10
h-10
```

Do NOT use:

``` tsx
bg-[var(--color-brand-500)]
text-[var(--color-fg-primary)]
border-[var(--color-border-primary)]

rounded-[var(--radius-md)]
rounded-[calc(var(--radius-md)-1px)]

leading-[var(--text-sm--line-height)]

p-[var(--spacing-3)]
gap-[var(--spacing-2)]

w-[var(--spacing-10)]
h-[var(--spacing-10)]
```

unless there is absolutely no equivalent Tailwind utility.

Generated Tailwind utilities must always be preferred.

------------------------------------------------------------------------

## Never bypass the theme system

Never access CSS variables directly when an equivalent Tailwind utility
exists.

This applies to:

-   colors
-   typography
-   spacing
-   sizing
-   radius
-   shadows
-   line heights
-   font sizes



------------------------------------------------------------------------

# Tailwind Theme Utility Consumption (Critical)

This project follows the official Untitled UI theming architecture.

Whenever a design token is exposed through the project's `@theme`, ALWAYS consume it through the generated Tailwind utility class.

For example, if the theme exposes:

- `--color-first-chat-card-surface`
- `--color-first-chat-card-icon`
- `--gradient-first-chat-card-title`

Use:

```tsx
bg-first-chat-card-surface
text-first-chat-card-icon
bg-gradient-first-chat-card-title
```

NEVER use arbitrary value syntax such as:

```tsx
bg-[var(--color-first-chat-card-surface)]
text-[var(--color-first-chat-card-icon)]
bg-[image:var(--gradient-first-chat-card-title)]
```

unless there is absolutely no generated Tailwind utility available.

The component layer must never access CSS variables directly when an equivalent Tailwind utility exists.

Always remember the official Untitled UI architecture:

Design Tokens
↓

@theme
↓

Generated Tailwind Utilities
↓

Components

Never bypass the theme layer by referencing CSS variables directly inside components.


------------------------------------------------------------------------

# Responsive architecture

Reusable components must always use `w-full`.

Parents control width.

Never use JavaScript responsive logic.

Use Tailwind responsive utilities only.

------------------------------------------------------------------------

# Kitchen page

Add the component to the Kitchen page.

Do not remove existing examples.

Wrap it in a responsive parent.

------------------------------------------------------------------------

# Validation

Run:

-   lint
-   type check
-   only the relevant tests

Fix every introduced issue.

------------------------------------------------------------------------

# Visual verification

Create Playwright visual tests following the existing project
conventions.

Requirements:

-   separate test per state
-   separate screenshot per state
-   wait for fonts
-   wait for full rendering
-   store screenshots in the existing structure

Do NOT use Pixelmatch or artificial thresholds.

Use Figma MCP as the visual source of truth.

Never weaken tests.

Never modify tests to pass.

Only improve the component implementation.

------------------------------------------------------------------------

# Final report

Provide:

-   every modified file
-   why each file changed
-   which Untitled UI component was reused
-   which design tokens were added or modified
-   which theme tokens were added or modified
-   which visual tests were created
-   which screenshots were generated
-   any deviations from Figma and the reason

------------------------------------------------------------------------

# Goal

Preserve the official Untitled UI architecture, use the project's design
token system and theme as the single source of truth, consume existing
Tailwind v4 theme utilities, avoid component-specific tokens, keep
reusable components responsive, validate with Playwright and Figma MCP,
and achieve the highest possible visual fidelity while making the
minimum necessary code changes.

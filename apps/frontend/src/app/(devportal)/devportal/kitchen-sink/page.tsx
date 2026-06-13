import { Button, Input, SearchModal, ShareModal } from "@ui";
import { Circle, CircleHelp, Mail } from "lucide-react";
import { Fragment, type ReactNode } from "react";

export const metadata = { title: "UI kitchen sink" };

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "xl";
type PreviewState = "default" | "hover" | "focused" | "disabled" | "loading";

type SectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const buttonText = "دکمه";
const inputLabel = "ایمیل";
const inputValue = "olivia@untitledui.com";
const inputHelper = "این یک متن راهنما برای کمک به کاربر است.";
const placeholderIcon = <Circle aria-hidden="true" />;
const mailIcon = <Mail className="size-full" aria-hidden="true" />;
const helpIcon = <CircleHelp className="size-full" aria-hidden="true" />;

const sizes: Array<{ label: string; size: ButtonSize }> = [
  { label: "sm", size: "sm" },
  { label: "md", size: "md" },
  { label: "lg", size: "lg" },
  { label: "xl", size: "xl" },
];

const hierarchies: Array<{ label: string; variant: ButtonVariant }> = [
  { label: "Primary", variant: "primary" },
  { label: "Secondary", variant: "secondary" },
  { label: "Text", variant: "ghost" },
];

const states: Array<{ label: string; state: PreviewState }> = [
  { label: "Default", state: "default" },
  { label: "Hover", state: "hover" },
  { label: "Focused", state: "focused" },
  { label: "Disabled", state: "disabled" },
  { label: "Loading", state: "loading" },
];

function Section({ title, description, children }: SectionProps) {
  const headingId = `section-${title.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <section
      className="border-t border-slate-200 py-8 first:border-t-0"
      aria-labelledby={headingId}
    >
      <div className="mb-5">
        <h2 id={headingId} className="text-lg font-semibold text-slate-950">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function previewClass(variant: ButtonVariant, state: PreviewState) {
  if (state === "hover") {
    return variant === "primary"
      ? "bg-[var(--button-primary-bg-hover)]"
      : variant === "secondary"
        ? "border-[var(--button-secondary-border-hover)] bg-[var(--button-secondary-bg-hover)] text-[var(--button-secondary-fg-hover)]"
        : "text-[var(--button-text-fg-hover)]";
  }

  if (state === "focused") {
    return variant === "ghost"
      ? "underline ring-0 ring-offset-0"
      : "ring-2 ring-[var(--button-focus-inner)] ring-offset-2 ring-offset-[var(--button-focus-outer)]";
  }

  return undefined;
}

function ButtonPreview({
  iconOnly = false,
  size,
  state,
  variant,
}: {
  iconOnly?: boolean;
  size: ButtonSize;
  state: PreviewState;
  variant: ButtonVariant;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      iconLeading={placeholderIcon}
      iconTrailing={iconOnly ? undefined : placeholderIcon}
      iconOnly={iconOnly}
      isDisabled={state === "disabled"}
      isLoading={state === "loading"}
      loadingText={buttonText}
      aria-label={iconOnly ? buttonText : undefined}
      className={previewClass(variant, state)}
    >
      {buttonText}
    </Button>
  );
}

function HierarchyGrid({ variant }: { variant: ButtonVariant }) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white p-4">
      <div className="grid min-w-max grid-cols-[7rem_repeat(4,minmax(8rem,1fr))] items-center gap-x-8 gap-y-4">
        <div />
        {sizes.map(({ label }) => (
          <div key={label} className="text-sm font-medium text-slate-600">
            {label}
          </div>
        ))}

        {states.map(({ label, state }) => (
          <Fragment key={state}>
            <div className="text-sm font-medium text-slate-700">{label}</div>
            {sizes.map(({ size }) => (
              <div key={`${state}-${size}`} className="flex justify-start" dir="rtl">
                <ButtonPreview variant={variant} size={size} state={state} />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function IconOnlyGrid({ variant }: { variant: Exclude<ButtonVariant, "ghost"> }) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white p-4">
      <div className="grid min-w-max grid-cols-[7rem_repeat(4,minmax(4rem,1fr))] items-center gap-x-8 gap-y-4">
        <div />
        {sizes.map(({ label }) => (
          <div key={label} className="text-sm font-medium text-slate-600">
            {label}
          </div>
        ))}

        {states.map(({ label, state }) => (
          <Fragment key={state}>
            <div className="text-sm font-medium text-slate-700">{label}</div>
            {sizes.map(({ size }) => (
              <div key={`${state}-${size}`} className="flex justify-start">
                <ButtonPreview variant={variant} size={size} state={state} iconOnly />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default function KitchenSink() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-brand-600">Devportal</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Button kitchen sink</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          The shared Untitled UI Button rendered in the sizes, hierarchies, states, and ordering
          present in the Figma Button component set.
        </p>
      </header>

      <div className="space-y-8">
        <Section
          title="Share modal"
          description="The shared Untitled UI Button and Input primitives composed into the Figma share dialog."
        >
          <ShareModal />
        </Section>

        <Section
          title="Search modal"
          description="The Untitled UI search surface from Figma rendered as a shared primitive."
        >
          <div className="grid gap-5 rounded-md border border-slate-200 bg-[var(--color-gray-70)] p-5 xl:grid-cols-2">
            <SearchModal />
            <SearchModal variant="results" />
          </div>
        </Section>

        <Section
          title="Input field"
          description="The shared Untitled UI Input rendered in the four states present in the Figma component."
        >
          <div className="grid gap-6 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-2">
            <Input
              label={inputLabel}
              requiredIndicator
              placeholder={inputValue}
              helperText={inputHelper}
              leadingIcon={mailIcon}
              trailingIcon={helpIcon}
            />
            <Input state="filled" label={inputLabel} requiredIndicator defaultValue={inputValue} />
            <Input
              state="focused"
              label={inputLabel}
              requiredIndicator
              defaultValue={inputValue}
              helperText={inputHelper}
              leadingIcon={mailIcon}
              trailingIcon={helpIcon}
            />
            <Input
              state="disabled"
              label={inputLabel}
              requiredIndicator
              placeholder={inputValue}
              helperText={inputHelper}
              leadingIcon={mailIcon}
              trailingIcon={helpIcon}
            />
          </div>
        </Section>

        {hierarchies.map(({ label, variant }) => (
          <Section
            key={variant}
            title={`${label} buttons`}
            description="Default, hover, focused, disabled, and loading states across Figma sizes."
          >
            <HierarchyGrid variant={variant} />
          </Section>
        ))}

        <Section
          title="Primary icon-only buttons"
          description="Icon-only states exist in Figma for Primary and Secondary hierarchies."
        >
          <IconOnlyGrid variant="primary" />
        </Section>

        <Section
          title="Secondary icon-only buttons"
          description="Icon-only states exist in Figma for Primary and Secondary hierarchies."
        >
          <IconOnlyGrid variant="secondary" />
        </Section>
      </div>
    </main>
  );
}

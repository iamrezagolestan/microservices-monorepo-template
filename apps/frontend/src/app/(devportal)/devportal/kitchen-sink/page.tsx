// Visual sanity check for the Untitled UI primitives under src/components/.
// The cheap alternative to a Storybook install: one page that renders every
// primitive once. Gated by the (devportal) Kratos session check (proxy.ts).
//
// Add one <Section> per primitive added under @/components/.
import { ArrowRight, Plus } from "@untitledui/icons";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/base/buttons/button";

export const metadata: Metadata = { title: "UI kitchen sink" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-secondary py-6 first:border-t-0">
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function KitchenSink() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <header>
        <h1 className="text-2xl font-semibold text-primary">UI kitchen sink</h1>
        <p className="mt-1 text-sm text-tertiary">
          Every primitive under <code>src/components/</code>, rendered once. Visual sanity check for
          the Untitled UI bump cadence; not a replacement for component tests.
        </p>
      </header>

      <Section title="Button — colors">
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="tertiary">Tertiary</Button>
        <Button color="link-color">Link</Button>
        <Button color="primary-destructive">Delete</Button>
      </Section>

      <Section title="Button — sizes">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra large</Button>
      </Section>

      <Section title="Button — icons & state">
        {/* This page is a Server Component, so icons are passed as elements
            (RSC-safe) rather than as component functions. In client components
            the canonical `iconLeading={Plus}` component form also works. */}
        <Button iconLeading={<Plus className="size-5" />}>Add item</Button>
        <Button color="secondary" iconTrailing={<ArrowRight className="size-5" />}>
          Continue
        </Button>
        <Button isLoading>Saving</Button>
        <Button isDisabled>Disabled</Button>
      </Section>
    </main>
  );
}

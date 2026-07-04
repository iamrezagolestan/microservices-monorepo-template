// Visual sanity check for src/components/ui primitives. The cheap alternative
// to a Storybook install: one public page that renders every primitive once.
//
// Add one <Section> per primitive added to @/components/ui.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import { InputKitchenExamples } from "./InputKitchenExamples";
import { KitchenThemeSwitch } from "./KitchenThemeSwitch";

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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">UI kitchen sink</h1>
          <p className="mt-1 text-sm text-tertiary">
            Every primitive in <code>src/components/ui</code>, rendered once. Visual sanity check
            for the Untitled UI bump cadence; not a replacement for component tests.
          </p>
        </div>
        <KitchenThemeSwitch />
      </header>

      <Section title="Button">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
      </Section>

      <Section title="Input">
        <InputKitchenExamples />
      </Section>
    </main>
  );
}

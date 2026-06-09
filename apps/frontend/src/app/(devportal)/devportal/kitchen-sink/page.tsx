import { Button } from "@ui";
import { Circle } from "lucide-react";
import type { ReactNode } from "react";

export const metadata = { title: "Button kitchen sink" };

const LABEL = "افزودن";
const ICON = <Circle strokeWidth={1.66667} />;

type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
type ButtonColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "link-color"
  | "link-gray"
  | "primary-destructive"
  | "secondary-destructive"
  | "tertiary-destructive"
  | "link-destructive";

const sizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

const variantGroups: Array<{
  title: string;
  colors: Array<{ color: ButtonColor; label: string }>;
}> = [
  {
    title: "دکمه های اصلی",
    colors: [
      { color: "primary", label: "Primary" },
      { color: "secondary", label: "Secondary" },
      { color: "tertiary", label: "Tertiary" },
    ],
  },
  {
    title: "دکمه های لینک",
    colors: [
      { color: "link-color", label: "Link color" },
      { color: "link-gray", label: "Link gray" },
    ],
  },
  {
    title: "دکمه های مخرب",
    colors: [
      { color: "primary-destructive", label: "Primary destructive" },
      { color: "secondary-destructive", label: "Secondary destructive" },
      { color: "tertiary-destructive", label: "Tertiary destructive" },
      { color: "link-destructive", label: "Link destructive" },
    ],
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[#E9EAEB] py-8 first:border-t-0">
      <h2 className="text-md font-semibold text-[#252B37]">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 md:grid-cols-[10rem_1fr] md:items-center">
      <div className="text-sm font-medium text-[#717680]">{label}</div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function SizeSet({
  color = "primary",
  iconMode = "both",
}: {
  color?: ButtonColor;
  iconMode?: "both" | "leading" | "trailing" | "only" | "none";
}) {
  return (
    <>
      {sizes.map((size) => {
        const iconOnly = iconMode === "only";

        return (
          <Button
            aria-label={iconOnly ? `${LABEL} ${size}` : undefined}
            color={color}
            iconLeading={iconMode === "both" || iconMode === "leading" || iconOnly ? ICON : undefined}
            iconTrailing={iconMode === "both" || iconMode === "trailing" ? ICON : undefined}
            key={`${color}-${size}-${iconMode}`}
            noTextPadding
            size={size}
          >
            {iconOnly ? undefined : LABEL}
          </Button>
        );
      })}
    </>
  );
}

export default function KitchenSink() {
  return (
    <main className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="mx-auto max-w-6xl rounded-lg border border-[#E9EAEB] bg-white p-6">
        {variantGroups.map((group) => (
          <Section key={group.title} title={group.title}>
            {group.colors.map(({ color, label }) => (
              <Row key={color} label={label}>
                <Button color={color} iconLeading={ICON} iconTrailing={ICON} noTextPadding>
                  {LABEL}
                </Button>
                <Button color={color} noTextPadding>
                  {LABEL}
                </Button>
                <Button color={color} iconLeading={ICON} aria-label={`${LABEL} icon`} />
                <Button color={color} iconLeading={ICON} iconTrailing={ICON} isDisabled noTextPadding>
                  {LABEL}
                </Button>
                <Button color={color} isLoading showTextWhileLoading noTextPadding>
                  {LABEL}
                </Button>
              </Row>
            ))}
          </Section>
        ))}

        <Section title="اندازه ها">
          <Row label="Icon + text">
            <SizeSet iconMode="both" />
          </Row>
          <Row label="Text only">
            <SizeSet iconMode="none" />
          </Row>
          <Row label="Icon leading">
            <SizeSet iconMode="leading" />
          </Row>
          <Row label="Icon trailing">
            <SizeSet iconMode="trailing" />
          </Row>
          <Row label="Icon only">
            <SizeSet iconMode="only" />
          </Row>
        </Section>

        <Section title="وضعیت ها">
          <Row label="Default">
            <Button iconLeading={ICON} iconTrailing={ICON} noTextPadding>
              {LABEL}
            </Button>
            <Button color="secondary" iconLeading={ICON} iconTrailing={ICON} noTextPadding>
              {LABEL}
            </Button>
            <Button color="link-color" iconLeading={ICON} iconTrailing={ICON} noTextPadding>
              {LABEL}
            </Button>
          </Row>
          <Row label="Disabled">
            <Button isDisabled iconLeading={ICON} iconTrailing={ICON} noTextPadding>
              {LABEL}
            </Button>
            <Button color="secondary" isDisabled iconLeading={ICON} iconTrailing={ICON} noTextPadding>
              {LABEL}
            </Button>
            <Button color="link-color" isDisabled iconLeading={ICON} iconTrailing={ICON} noTextPadding>
              {LABEL}
            </Button>
          </Row>
          <Row label="Loading">
            <Button isLoading showTextWhileLoading noTextPadding>
              {LABEL}
            </Button>
            <Button color="secondary" isLoading showTextWhileLoading noTextPadding>
              {LABEL}
            </Button>
            <Button color="primary-destructive" isLoading showTextWhileLoading noTextPadding>
              {LABEL}
            </Button>
          </Row>
        </Section>
      </div>
    </main>
  );
}

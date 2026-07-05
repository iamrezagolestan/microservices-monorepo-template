"use client";

import { Circle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";

const hierarchies = ["primary", "secondary", "tertiary"] as const;
const iconHierarchies = ["primary", "secondary"] as const;
const sizes = ["sm", "md", "lg", "xl"] as const;
const states = ["default", "hover", "focused", "disabled", "loading"] as const;
const label = "دکمه";

type Hierarchy = (typeof hierarchies)[number];
type IconHierarchy = (typeof iconHierarchies)[number];
type Size = (typeof sizes)[number];
type State = (typeof states)[number];

const buttonWidths: Record<Size, Record<Hierarchy, Partial<Record<State, string>>>> = {
  sm: {
    primary: {
      default: "w-[109px]",
      disabled: "w-[109px]",
      focused: "w-[109px]",
      hover: "w-[109px]",
      loading: "w-[85px]",
    },
    secondary: {
      default: "w-[109px]",
      disabled: "w-[109px]",
      focused: "w-[109px]",
      hover: "w-[109px]",
      loading: "w-[85px]",
    },
    tertiary: { default: "w-[85px]", disabled: "w-[85px]", focused: "w-[85px]", hover: "w-[85px]" },
  },
  md: {
    primary: {
      default: "w-[113px]",
      disabled: "w-[113px]",
      focused: "w-[113px]",
      hover: "w-[113px]",
      loading: "w-[89px]",
    },
    secondary: {
      default: "w-[113px]",
      disabled: "w-[113px]",
      focused: "w-[113px]",
      hover: "w-[113px]",
      loading: "w-[89px]",
    },
    tertiary: {
      default: "w-[101px]",
      disabled: "w-[101px]",
      focused: "w-[101px]",
      hover: "w-[101px]",
    },
  },
  lg: {
    primary: {
      default: "w-[121px]",
      disabled: "w-[121px]",
      focused: "w-[121px]",
      hover: "w-[121px]",
      loading: "w-[95px]",
    },
    secondary: {
      default: "w-[121px]",
      disabled: "w-[121px]",
      focused: "w-[121px]",
      hover: "w-[121px]",
      loading: "w-[95px]",
    },
    tertiary: {
      default: "w-[121px]",
      disabled: "w-[121px]",
      focused: "w-[121px]",
      hover: "w-[121px]",
    },
  },
  xl: {
    primary: {
      default: "w-[125px]",
      disabled: "w-[125px]",
      focused: "w-[125px]",
      hover: "w-[125px]",
      loading: "w-[99px]",
    },
    secondary: {
      default: "w-[125px]",
      disabled: "w-[125px]",
      focused: "w-[125px]",
      hover: "w-[125px]",
      loading: "w-[99px]",
    },
    tertiary: {
      default: "w-[129px]",
      disabled: "w-[129px]",
      focused: "w-[129px]",
      hover: "w-[129px]",
    },
  },
};

const iconWidths: Record<Size, string> = {
  lg: "w-11",
  md: "w-10",
  sm: "w-9",
  xl: "w-12",
};

function Preview({
  children,
  testId,
  width,
}: {
  children: ReactNode;
  testId: string;
  width: string;
}) {
  return (
    <div className={width} data-testid={testId}>
      {children}
    </div>
  );
}

function buttonStateProps(state: State) {
  return {
    isDisabled: state === "disabled",
    isLoading: state === "loading",
    showTextWhileLoading: state === "loading",
  };
}

function ButtonPreview({
  hierarchy,
  size,
  state,
}: {
  hierarchy: Hierarchy;
  size: Size;
  state: State;
}) {
  const width = buttonWidths[size][hierarchy][state];

  if (!width) {
    return null;
  }

  return (
    <Preview testId={["button", hierarchy, size, state].join("-")} width={width}>
      <Button
        color={hierarchy}
        iconLeading={state === "loading" ? undefined : Circle}
        iconTrailing={state === "loading" ? undefined : Circle}
        size={size}
        {...buttonStateProps(state)}
      >
        {label}
      </Button>
    </Preview>
  );
}

function IconButtonPreview({
  hierarchy,
  size,
  state,
}: {
  hierarchy: IconHierarchy;
  size: Size;
  state: State;
}) {
  return (
    <Preview
      testId={["button", hierarchy, size, state, "icon-only"].join("-")}
      width={iconWidths[size]}
    >
      <Button
        aria-label={label}
        color={hierarchy}
        iconLeading={state === "loading" ? undefined : Circle}
        isDisabled={state === "disabled"}
        isLoading={state === "loading"}
        size={size}
      />
    </Preview>
  );
}

function statesForHierarchy(hierarchy: Hierarchy) {
  return hierarchy === "tertiary" ? states.filter((state) => state !== "loading") : states;
}

function ButtonMatrix({ hierarchy }: { hierarchy: Hierarchy }) {
  return (
    <div className="grid grid-cols-4 items-start gap-x-16 gap-y-3">
      {statesForHierarchy(hierarchy).map((state) =>
        sizes.map((size) => (
          <ButtonPreview
            hierarchy={hierarchy}
            key={`${hierarchy}-${state}-${size}`}
            size={size}
            state={state}
          />
        )),
      )}
    </div>
  );
}

function IconButtonMatrix({ hierarchy }: { hierarchy: IconHierarchy }) {
  return (
    <div className="grid grid-cols-4 items-start gap-x-5 gap-y-3">
      {states.map((state) =>
        sizes.map((size) => (
          <IconButtonPreview
            hierarchy={hierarchy}
            key={`${hierarchy}-${state}-${size}-icon`}
            size={size}
            state={state}
          />
        )),
      )}
    </div>
  );
}

function HierarchyExamples({ hierarchy }: { hierarchy: Hierarchy }) {
  const hasIconButtons = iconHierarchies.includes(hierarchy as IconHierarchy);

  return (
    <div className="grid w-max grid-cols-[max-content] gap-x-20 gap-y-6 xl:grid-cols-[max-content_max-content]">
      <ButtonMatrix hierarchy={hierarchy} />
      {hasIconButtons && <IconButtonMatrix hierarchy={hierarchy as IconHierarchy} />}
    </div>
  );
}

export function ButtonKitchenExamples() {
  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-14 pb-2 p-2">
        {hierarchies.map((hierarchy) => (
          <HierarchyExamples hierarchy={hierarchy} key={hierarchy} />
        ))}
      </div>
    </div>
  );
}

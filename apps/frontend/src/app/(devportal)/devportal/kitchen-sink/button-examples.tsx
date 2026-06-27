"use client";

import { Button } from "@/components/ui";
import { Circle } from "lucide-react";

const LABEL = "دکمه";
const hierarchies = ["primary", "secondary", "text"] as const;
const filledHierarchies = ["primary", "secondary"] as const;
const sizes = ["sm", "md", "lg", "xl"] as const;
const states = ["default", "hover", "focused", "disabled", "loading"] as const;
const iconOnlyStates = ["default", "hover", "focused", "disabled", "loading"] as const;

type Hierarchy = (typeof hierarchies)[number];
type FilledHierarchy = (typeof filledHierarchies)[number];
type Size = (typeof sizes)[number];
type State = (typeof states)[number];

const colorByHierarchy: Record<Hierarchy, "primary" | "secondary" | "text"> = {
  primary: "primary",
  secondary: "secondary",
  text: "text",
};

const stateClassName: Record<State, string> = {
  default: "",
  hover: "",
  focused: "",
  disabled: "",
  loading: "",
};

const wrapperClassName = "inline-flex shrink-0";

const filledButtonWrapperSize: Record<Size, string> = {
  sm: "w-[108px] h-[36px]",
  md: "w-[112px] h-[40px]",
  lg: "w-[120px] h-[44px]",
  xl: "w-[120px] h-[48px]",
};

const textButtonWrapperSize: Record<Size, string> = {
  sm: "w-[96px] h-[36px]",
  md: "w-[100px] h-[40px]",
  lg: "w-[108px] h-[40px]",
  xl: "w-[108px] h-[44px]",
};

const iconOnlyButtonWrapperSize: Record<Size, string> = {
  sm: "w-[36px] h-[36px]",
  md: "w-[40px] h-[40px]",
  lg: "w-[44px] h-[44px]",
  xl: "w-[48px] h-[48px]",
};

function testId(parts: string[]) {
  return parts.join("-");
}

function ButtonIcon({
  hierarchy,
  placement,
}: {
  hierarchy: Hierarchy;
  placement: "leading" | "trailing";
}) {
  return <Circle className={hierarchy === "text" ? "size-4" : "size-5"} data-icon={placement} />;
}

function ButtonExample({
  hierarchy,
  size,
  state,
}: {
  hierarchy: Hierarchy;
  size: Size;
  state: State;
}) {
  const isDisabled = state === "disabled";
  const isLoading = state === "loading";

  return (
    <Button
      className={stateClassName[state]}
      color={colorByHierarchy[hierarchy]}
      data-testid={testId(["button", hierarchy, size, state])}
      iconLeading={<ButtonIcon hierarchy={hierarchy} placement="leading" />}
      iconTrailing={<ButtonIcon hierarchy={hierarchy} placement="trailing" />}
      isDisabled={isDisabled}
      isLoading={isLoading}
      showTextWhileLoading
      size={size}
    >
      {LABEL}
    </Button>
  );
}

function IconButtonExample({
  hierarchy,
  size,
  state,
}: {
  hierarchy: FilledHierarchy;
  size: Size;
  state: State;
}) {
  const isDisabled = state === "disabled";
  const isLoading = state === "loading";

  return (
    <Button
      className={stateClassName[state]}
      color={colorByHierarchy[hierarchy]}
      data-testid={testId(["button", hierarchy, size, state, "icon-only"])}
      iconLeading={<ButtonIcon hierarchy={hierarchy} placement="leading" />}
      isDisabled={isDisabled}
      isLoading={isLoading}
      size={size}
    />
  );
}

export function ButtonExamples() {
  return (
    <div className="flex w-full flex-col gap-10" dir="rtl">
      {filledHierarchies.map((hierarchy) => (
        <div className="flex flex-col gap-4" key={hierarchy}>
          {states.map((state) => (
            <div className="grid grid-cols-4 items-center gap-x-14 gap-y-4" key={state}>
              {sizes.map((size) => (
                <div className={`${wrapperClassName} ${filledButtonWrapperSize[size]}`} key={size}>
                  <ButtonExample hierarchy={hierarchy} size={size} state={state} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <div className="flex flex-col gap-4">
        {states.map((state) => (
          <div className="grid grid-cols-4 items-center gap-x-14 gap-y-4" key={state}>
            {sizes.map((size) => (
              <div className={`${wrapperClassName} ${textButtonWrapperSize[size]}`} key={size}>
                <ButtonExample hierarchy="text" size={size} state={state} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-16">
        {filledHierarchies.map((hierarchy) => (
          <div className="flex flex-col gap-4" key={hierarchy}>
            {iconOnlyStates.map((state) => (
              <div className="grid grid-cols-4 items-center gap-x-6" key={state}>
                {sizes.map((size) => (
                  <div
                    className={`${wrapperClassName} ${iconOnlyButtonWrapperSize[size]}`}
                    key={size}
                  >
                    <IconButtonExample hierarchy={hierarchy} size={size} state={state} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

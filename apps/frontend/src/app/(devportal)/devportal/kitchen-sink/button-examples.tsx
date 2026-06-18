"use client";

import { Button } from "@ui";
import { Circle } from "lucide-react";

const BUTTON_TEXT = "دکمه";
const BUTTON_SIZES = ["sm", "md", "lg", "xl"] as const;
const SOLID_COLORS = ["primary", "secondary"] as const;
const SOLID_STATES = ["default", "hover", "focused", "disabled", "loading"] as const;
const ICON_STATES = ["default", "hover", "focused", "disabled", "loading"] as const;
const TEXT_STATES = ["default", "hover", "focused", "disabled"] as const;

type ButtonSize = (typeof BUTTON_SIZES)[number];
type SolidColor = (typeof SOLID_COLORS)[number];
type ButtonState = (typeof SOLID_STATES)[number];

function isDisabledState(state: ButtonState) {
  return state === "disabled";
}

function isLoadingState(state: ButtonState) {
  return state === "loading";
}

function stateSuffix(state: ButtonState) {
  if (state === "default") {
    return "";
  }

  return `-${state}`;
}

function ButtonTarget({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const isFocused = name.includes("focused");
  const isMediumSolid = /^(primary|secondary)-md($|-)/.test(name) && !name.includes("icon-only");
  const wrapperPadding = isFocused ? "p-0.5" : "";
  const wrapperVerticalPadding = !isFocused && isMediumSolid ? "py-0.5" : "";

  return (
    <div
      data-testid={`button-${name}`}
      className={`inline-flex ${wrapperPadding} ${wrapperVerticalPadding} w-full`}
    >
      {children}
    </div>
  );
}

function SolidButtonExample({
  color,
  size,
  state,
}: {
  color: SolidColor;
  size: ButtonSize;
  state: ButtonState;
}) {
  const name = `${color}-${size}${stateSuffix(state)}`;

  return (
    <ButtonTarget name={name}>
      <Button
        color={color}
        iconLeading={Circle}
        iconTrailing={Circle}
        isDisabled={isDisabledState(state)}
        isLoading={isLoadingState(state)}
        showTextWhileLoading
        size={size}
      >
        {BUTTON_TEXT}
      </Button>
    </ButtonTarget>
  );
}

function IconButtonExample({
  color,
  size,
  state,
}: {
  color: SolidColor;
  size: ButtonSize;
  state: ButtonState;
}) {
  const name = `${color}-${size}-icon-only${stateSuffix(state)}`;

  return (
    <ButtonTarget name={name}>
      <Button
        aria-label={BUTTON_TEXT}
        color={color}
        iconLeading={Circle}
        isDisabled={isDisabledState(state)}
        isLoading={isLoadingState(state)}
        size={size}
      />
    </ButtonTarget>
  );
}

function TextButtonExample({ size, state }: { size: ButtonSize; state: ButtonState }) {
  const name = `text-${size}${stateSuffix(state)}`;

  return (
    <ButtonTarget name={name}>
      <Button
        color="text"
        iconLeading={Circle}
        iconTrailing={Circle}
        isDisabled={isDisabledState(state)}
        size={size}
      >
        {BUTTON_TEXT}
      </Button>
    </ButtonTarget>
  );
}

export function ButtonExamples() {
  return (
    <div className="flex flex-col gap-8">
      {SOLID_COLORS.map((color) => (
        <div key={color} className="grid grid-cols-4 gap-x-14 gap-y-4">
          {BUTTON_SIZES.map((size) => (
            <div key={`${color}-${size}`} className="flex flex-col items-start gap-4">
              {SOLID_STATES.map((state) => (
                <SolidButtonExample
                  key={`${color}-${size}-${state}`}
                  color={color}
                  size={size}
                  state={state}
                />
              ))}
            </div>
          ))}

          {BUTTON_SIZES.map((size) => (
            <div key={`${color}-${size}-icon-only`} className="flex flex-col items-start gap-4">
              {ICON_STATES.map((state) => (
                <IconButtonExample
                  key={`${color}-${size}-icon-${state}`}
                  color={color}
                  size={size}
                  state={state}
                />
              ))}
            </div>
          ))}
        </div>
      ))}

      <div className="grid grid-cols-4 gap-x-14 gap-y-4">
        {BUTTON_SIZES.map((size) => (
          <div key={`text-${size}`} className="flex flex-col items-start gap-4">
            {TEXT_STATES.map((state) => (
              <TextButtonExample key={`text-${size}-${state}`} size={size} state={state} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Mail01 } from "@untitledui/icons";
import type { ReactNode } from "react";
import { Input } from "@/components/ui";

const email = "olivia@untitledui.com";
const label = "ایمیل";
const inputHint = "این یک متن راهنما برای کمک به کاربر است."
const figmaInputTextClassName = "text-right";

function InputPreview({ children, testId }: { children: ReactNode; testId: string }) {
  return <div data-testid={testId}>{children}</div>;
}

export function InputKitchenExamples() {
  return (
    <>
      <div className="flex flex-col gap-3 max-w-[320px] w-full">
        <InputPreview testId="input-default">
          <Input
            hint={inputHint}
            icon={Mail01}
            iconPosition="trailing"
            inputClassName={figmaInputTextClassName}
            isRequired
            label={label}
            placeholder={email}
            requiredIndicatorPosition="trailing"
            tooltip="Help"
            tooltipPosition="leading"
          />
        </InputPreview>

        <InputPreview testId="input-filled">
          <Input
            defaultValue={email}
            inputClassName={figmaInputTextClassName}
            isRequired
            label={label}
            requiredIndicatorPosition="trailing"
          />
        </InputPreview>

        <InputPreview testId="input-focused">
          <Input
            defaultValue={email}
            hint={inputHint}
            icon={Mail01}
            iconPosition="trailing"
            inputClassName={figmaInputTextClassName}
            isRequired
            label={label}
            requiredIndicatorPosition="trailing"
            tooltip="Help"
            tooltipPosition="leading"
          />
        </InputPreview>

        <InputPreview testId="input-disabled">
          <Input
            defaultValue={email}
            hint={inputHint}
            icon={Mail01}
            iconPosition="trailing"
            inputClassName={figmaInputTextClassName}
            isDisabled
            isRequired
            label={label}
            requiredIndicatorPosition="trailing"
            tooltip="Help"
            tooltipPosition="leading"
          />
        </InputPreview>
      </div>
    </>
  );
}

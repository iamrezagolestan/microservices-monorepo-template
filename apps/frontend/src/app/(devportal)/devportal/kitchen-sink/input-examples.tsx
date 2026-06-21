"use client";

import { Input } from "@ui";
import { Mail01 } from "@untitledui/icons";

const INPUT_FIELD_CLASS_NAME = "figma-input-field w-[324px] items-end gap-1.5 text-right";
const INPUT_ICON_CLASS_NAME = "right-3 left-auto size-5 text-(--input-icon-fg)";
const INPUT_TOOLTIP_CLASS_NAME = "right-auto left-3 text-(--input-icon-fg)";
const INPUT_TEXT_CLASS_NAME = "pr-10 pl-9 text-right";
const INPUT_HINT_CLASS_NAME = "w-full text-right";
const INPUT_LABEL_CLASS_NAME = "w-[320px] justify-start text-right";
const INPUT_WRAPPER_CLASS_NAME = "h-10 w-[320px]";
const EMAIL_LABEL = "ایمیل";
const EMAIL_VALUE = "olivia@untitledui.com";
const HELP_TEXT = "این یک متن راهنما برای کمک به کاربر است.";

function InputHint() {
  return <span className={INPUT_HINT_CLASS_NAME}>{HELP_TEXT}</span>;
}

export function InputExamples() {
  return (
    <div className="flex min-w-[324px] max-w-[324px] flex-col gap-5">
      <Input
        className={INPUT_FIELD_CLASS_NAME}
        data-testid="input-default"
        hideRequiredIndicator={false}
        hint={<InputHint />}
        icon={Mail01}
        iconClassName={INPUT_ICON_CLASS_NAME}
        inputClassName={INPUT_TEXT_CLASS_NAME}
        isRequired
        label={EMAIL_LABEL}
        labelClassName={INPUT_LABEL_CLASS_NAME}
        placeholder={EMAIL_VALUE}
        size="md"
        tooltip="Help"
        tooltipClassName={INPUT_TOOLTIP_CLASS_NAME}
        wrapperClassName={INPUT_WRAPPER_CLASS_NAME}
      />
      <Input
        className={`${INPUT_FIELD_CLASS_NAME} min-h-[69px]`}
        data-testid="input-filled"
        defaultValue={EMAIL_VALUE}
        hideRequiredIndicator={false}
        inputClassName="text-right text-(--input-fg)"
        isRequired
        label={EMAIL_LABEL}
        labelClassName={INPUT_LABEL_CLASS_NAME}
        size="md"
        wrapperClassName={INPUT_WRAPPER_CLASS_NAME}
      />
      <Input
        className={INPUT_FIELD_CLASS_NAME}
        data-testid="input-focused"
        defaultValue={EMAIL_VALUE}
        hideRequiredIndicator={false}
        hint={<InputHint />}
        icon={Mail01}
        iconClassName={INPUT_ICON_CLASS_NAME}
        inputClassName={INPUT_TEXT_CLASS_NAME}
        isRequired
        label={EMAIL_LABEL}
        labelClassName={INPUT_LABEL_CLASS_NAME}
        size="md"
        tooltip="Help"
        tooltipClassName={INPUT_TOOLTIP_CLASS_NAME}
        wrapperClassName={`${INPUT_WRAPPER_CLASS_NAME} ring-2 ring-(--input-border-focus)`}
      />
      <Input
        className={INPUT_FIELD_CLASS_NAME}
        data-testid="input-disabled"
        defaultValue={EMAIL_VALUE}
        hideRequiredIndicator={false}
        hint={<InputHint />}
        icon={Mail01}
        iconClassName={INPUT_ICON_CLASS_NAME}
        inputClassName={INPUT_TEXT_CLASS_NAME}
        isDisabled={true}
        isRequired
        label={EMAIL_LABEL}
        labelClassName={INPUT_LABEL_CLASS_NAME}
        size="md"
        tooltip="Help"
        tooltipClassName={INPUT_TOOLTIP_CLASS_NAME}
        wrapperClassName={INPUT_WRAPPER_CLASS_NAME}
      />
    </div>
  );
}

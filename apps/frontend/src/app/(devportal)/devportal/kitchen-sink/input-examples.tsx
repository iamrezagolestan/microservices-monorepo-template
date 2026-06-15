"use client";

import { Input } from "@ui";
import { Mail01 } from "@untitledui/icons";

const INPUT_FIELD_CLASS_NAME = "w-80 items-start";
const INPUT_ICON_CLASS_NAME = "right-3 left-auto size-5";
const INPUT_TOOLTIP_CLASS_NAME = "right-auto left-3";
const INPUT_TEXT_CLASS_NAME = "pr-10 pl-9 text-right";
const INPUT_HINT_CLASS_NAME = "w-full text-right";
const INPUT_WRAPPER_CLASS_NAME = "h-10";
const EMAIL_LABEL = "ایمیل";
const EMAIL_VALUE = "olivia@untitledui.com";
const HELP_TEXT = "این یک متن راهنما برای کمک به کاربر است.";

function InputHint() {
  return <span className={INPUT_HINT_CLASS_NAME}>{HELP_TEXT}</span>;
}

export function InputExamples() {
  return (
    <div className="flex flex-col gap-5" dir="rtl">
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
        placeholder={EMAIL_VALUE}
        size="md"
        tooltip="Help"
        tooltipClassName={INPUT_TOOLTIP_CLASS_NAME}
        wrapperClassName={INPUT_WRAPPER_CLASS_NAME}
      />
      <Input
        className={INPUT_FIELD_CLASS_NAME}
        data-testid="input-filled"
        defaultValue={EMAIL_VALUE}
        hideRequiredIndicator={false}
        inputClassName="text-right"
        isRequired
        label={EMAIL_LABEL}
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
        isDisabled
        isRequired
        label={EMAIL_LABEL}
        size="md"
        tooltip="Help"
        tooltipClassName={INPUT_TOOLTIP_CLASS_NAME}
        wrapperClassName={INPUT_WRAPPER_CLASS_NAME}
      />
    </div>
  );
}

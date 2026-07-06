"use client";

import { Copy01, Edit02 } from "@untitledui/icons";
import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { Button } from "../../base/button/button";
import { TextAreaBase } from "../../base/textArea/textArea";
import { Tooltip, TooltipTrigger } from "../../base/tooltip/tooltip";
import { cx } from "@/utils/cx";

export type TypeBoxProps = {
  className?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

const defaultText =
  "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.";

export function TypeBox({
  className,
  defaultValue = defaultText,
  onValueChange,
  value: controlledValue,
}: TypeBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const [draftValue, setDraftValue] = useState(value);

  const handleCopy = useCallback(() => {
    void navigator.clipboard?.writeText(value);
  }, [value]);

  const handleEdit = useCallback(() => {
    setDraftValue(value);
    setIsEditing(true);
  }, [value]);

  const handleCancel = useCallback(() => {
    setDraftValue(value);
    setIsEditing(false);
  }, [value]);

  const handleDraftChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraftValue(event.target.value);
  }, []);

  const handleSave = useCallback(() => {
    if (typeof controlledValue === "undefined") {
      setUncontrolledValue(draftValue);
    }

    onValueChange?.(draftValue);
    setIsEditing(false);
  }, [controlledValue, draftValue, onValueChange]);

  const textClassName = "min-w-px text-right text-md font-normal leading-6 text-primary";
  const iconButtonClassName =
    "flex size-5 cursor-pointer items-center justify-center p-0 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:ring-2 focus:ring-focus-ring focus:ring-inset disabled:cursor-not-allowed disabled:text-disabled";

  return (
    <div className={cx("flex w-full flex-col items-start gap-4", className)}>
      <div className="w-full rounded-xl bg-primary_hover p-4">
        {isEditing ? (
          <TextAreaBase
            aria-label="Type box text"
            rows={1}
            size="md"
            value={draftValue}
            onChange={handleDraftChange}
            className={cx(
              textClassName,
              "field-sizing-content max-h-72 overflow-y-auto rounded-none bg-transparent p-0 shadow-none ring-0 focus:ring-0",
            )}
          />
        ) : (
          <p className={textClassName} dir="auto">
            {value}
          </p>
        )}
      </div>

      {isEditing ? (
        <div className="flex self-end gap-3">
          <Button className="max-w-[118px] w-[118px]" color="secondary" size="md" onPress={handleCancel}>
            لغو
          </Button>
          <Button className="max-w-[118px] w-[118px]" size="md" onPress={handleSave}>
            ویرایش
          </Button>
        </div>
      ) : (
        <div className="flex w-full items-center justify-end gap-10">
          <Tooltip title="Edit" placement="top">
            <TooltipTrigger
              aria-label="Edit text"
              className={iconButtonClassName}
              onPress={handleEdit}
            >
              <Edit02 className="size-5" />
            </TooltipTrigger>
          </Tooltip>

          <Tooltip title="Copy" placement="top">
            <TooltipTrigger
              aria-label="Copy text"
              className={iconButtonClassName}
              onPress={handleCopy}
            >
              <Copy01 className="size-5" />
            </TooltipTrigger>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

TypeBox.displayName = "TypeBox";

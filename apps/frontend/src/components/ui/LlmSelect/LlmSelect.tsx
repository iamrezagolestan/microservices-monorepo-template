"use client";

import { Stars01 } from "@untitledui/icons";
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import chatGptIcon from "@/assets/model-chatgpt.svg";
import gemeniIcon from "@/assets/model-gemeni.svg";
import grokIcon from "@/assets/model-grok.svg";
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
} from "@/components/base/select/select";
import { cx } from "@/utils/cx";

export type LlmModel = {
  description: string;
  icon: StaticImageData;
  id: string;
  name: string;
};

export type LlmSelectProps = {
  className?: string;
  defaultSelectedId?: string;
  onModelSelect?: (model: LlmModel) => void;
  trigger?: "button" | "icon";
};

type SelectKey = string | number;

export const llmModels: LlmModel[] = [
  {
    description: "جدیدترین مدل Open AI",
    icon: chatGptIcon,
    id: "chat-gpt-5-1",
    name: "Chat GPT 5.1",
  },
  {
    description: "جدیدترین مدل Open AI",
    icon: gemeniIcon,
    id: "gemeni-3-5",
    name: "Gemeni 3.5",
  },
  {
    description: "سریع تر و کدنویسی",
    icon: grokIcon,
    id: "grok-3-5",
    name: "Grok 3.5",
  },
];

function ModelIcon({ icon }: { icon: StaticImageData }) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className="size-6 dark:invert"
      height={24}
      src={icon}
      width={24}
    />
  );
}

function ModelRow({ model }: { model: LlmModel }) {
  return (
    <div className="flex w-full items-center justify-between">
      <ModelIcon icon={model.icon} />
      <div className="flex flex-col items-end justify-center text-right">
        <p className="whitespace-nowrap text-md font-semibold text-primary">{model.name}</p>
        <p className="whitespace-nowrap text-xs font-regular text-tertiary">{model.description}</p>
      </div>
    </div>
  );
}

function LlmTrigger({ trigger }: { trigger: LlmSelectProps["trigger"] }) {
  if (trigger === "icon") {
    return (
      <SelectTrigger
        aria-label="AI tools"
        data-testid="llm-select-trigger-icon"
        className="group inline-flex size-9 w-auto items-center justify-center rounded-lg bg-transparent p-2 hover:text-blue-700 focus:ring-0 focus:shadow-none focus-visible:shadow-none *:data-icon:size-5 *:data-icon:text-featured-icon-light-fg-gray hover:*:data-icon:text-fg-quaternary_hover"
      >
        <Stars01 className="size-5" data-icon="leading" />
      </SelectTrigger>
    );
  }

  return (
    <SelectTrigger
      data-testid="llm-select-trigger-button"
      className="w-[164px] px-3.5 py-2.5 text-md font-semibold"
    >
      Open model select
    </SelectTrigger>
  );
}

export function LlmSelect({
  className,
  defaultSelectedId = llmModels[0]?.id,
  onModelSelect,
  trigger = "button",
}: LlmSelectProps) {
  const [selectedKey, setSelectedKey] = useState<SelectKey | null>(defaultSelectedId ?? null);

  const handleSelectionChange = (key: SelectKey | null) => {
    setSelectedKey(key);
    const selectedModel = llmModels.find((model) => model.id === key);
    if (selectedModel) {
      onModelSelect?.(selectedModel);
    }
  };

  return (
    <Select<LlmModel>
      aria-label="Model select"
      className={className}
      selectedKey={selectedKey}
      onSelectionChange={handleSelectionChange}
    >
      <LlmTrigger trigger={trigger} />
      <SelectPopover
        data-testid="llm-select-popover"
        placement="top start"
        className="w-[239px] overflow-hidden p-0"
      >
        <div className="flex w-full items-start justify-center gap-3.5 overflow-hidden rounded-lg bg-primary_hover p-4">
          <SelectListBox<LlmModel>
            className="flex w-full flex-col items-end justify-center gap-2 overflow-visible"
            items={llmModels}
          >
            {(model) => (
              <SelectItem
                id={model.id}
                textValue={`${model.name} ${model.description}`}
                className={({ isSelected }) =>
                  cx(
                    "flex w-full flex-col items-start gap-3 rounded-t-xs rounded-br-xs text-primary py-1.5 px-3 rounded-md",
                    isSelected && "bg-primary",
                    model.id !== selectedKey &&
                      model.id !== llmModels[llmModels.length - 1]?.id &&
                      "pb-0",
                  )
                }
              >
                <ModelRow model={model} />
                {model.id !== selectedKey && model.id !== llmModels[llmModels.length - 1]?.id && (
                  <span className="h-px w-full bg-border-primary" />
                )}
              </SelectItem>
            )}
          </SelectListBox>
        </div>
      </SelectPopover>
    </Select>
  );
}

LlmSelect.displayName = "LlmSelect";

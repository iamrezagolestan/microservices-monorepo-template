"use client";

import { SearchLg, XClose } from "@untitledui/icons";
import { useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";

const resultLabel = "\u062c\u062f\u06cc\u062f\u062a\u0631\u06cc\u0646";
const searchTitle = "\u062c\u0633\u062a\u062c\u0648 \u06a9\u0646\u06cc\u062f";
const searchPlaceholder =
  "\u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u06af\u0641\u062a\u200c\u0648\u06af\u0648\u0647\u0627";
const emptyMessage =
  "\u0628\u0631\u0627\u06cc \u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u06af\u0641\u062a\u200c\u0648\u06af\u0648\u0647\u0627\u060c \u0639\u0628\u0627\u0631\u062a \u0645\u0648\u0631\u062f \u0646\u0638\u0631 \u062e\u0648\u062f \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f";
const resultItems = [resultLabel, resultLabel, resultLabel, resultLabel];

export type SearchModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

function EmptyState() {
  return (
    <div
      className="flex h-[263px] w-full shrink-0 flex-col items-center justify-center gap-2"
      data-testid="search-modal-empty-state"
    >
      <SearchLg aria-hidden="true" className="size-12 text-fg-quaternary" />
      <p className="max-w-full truncate text-end text-md font-regular text-placeholder">
        {emptyMessage}
      </p>
    </div>
  );
}

function ResultList() {
  return (
    <div
      className="flex w-full cursor-pointer flex-col items-start gap-2"
      data-testid="search-modal-results"
    >
      {resultItems.map((item, index) => (
        <>
        <AriaButton
          className="flex w-full cursor-pointer flex-col p-1 rounded-md text-end outline-focus-ring transition duration-100 ease-linear  hover:bg-bg-primary_hover focus-visible:ring-2 focus-visible:ring-focus-ring"
          key={`${item}-${index}`}
          type="button"
        >
          <span className="w-full text-start font-semibold text-primary">
            {item}
          </span>
        </AriaButton>
          {index < resultItems.length - 1 && <span className="h-px w-full bg-border-primary" />}
          </>
      ))}
    </div>
  );
}

export function SearchModal({ isOpen, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const hasQuery = query.trim().length > 0;

  function handleOpenChange(nextIsOpen: boolean) {
    if (!nextIsOpen) {
      setQuery("");
    }

    onOpenChange(nextIsOpen);
  }

  return (
    <ModalOverlay isDismissable isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal className="w-full max-w-[640px] overflow-hidden rounded-2xl bg-tertiary shadow-xl">
        <Dialog
          aria-label="Search conversations"
          className="w-full overflow-hidden outline-hidden"
          data-testid="search-modal"
        >
          {({ close }) => (
            <div className="flex w-full flex-col items-center">
              <div className="relative flex w-full shrink-0 flex-col items-center">
                <div className="flex w-full items-start justify-end gap-4 p-4">
                  <div className="flex flex-row items-center gap-0.5 justify-between w-full">
                    <h2 className="min-h-6 w-full truncate text-start text-md font-semibold text-brand-primary">
                      جست و جو کنید
                    </h2>
                    <AriaButton
                      aria-label="Close search"
                      className="flex size-11 cursor-pointer items-center justify-center rounded-md p-2 text-fg-secondary outline-focus-ring transition duration-100 ease-linear hover:bg-active hover:text-fg-secondary_hover focus-visible:ring-2 focus-visible:ring-focus-ring"
                      onPress={close}
                      type="button"
                    >
                      <XClose aria-hidden="true" className="size-6" />
                    </AriaButton>
                  </div>
                </div>

                <div className="h-px w-full shrink-0 bg-border-primary" />
              </div>

              <div className="flex w-full shrink-0 flex-col items-end gap-5 px-6 py-5">
                <Input
                  aria-label={searchPlaceholder}
                  autoFocus
                  icon={SearchLg}
                  iconPosition="leading"
                  onChange={setQuery}
                  placeholder={searchPlaceholder}
                  size="lg"
                  value={query}
                  wrapperClassName={cx(
                    "bg-tertiary",
                    "ring-primary shadow-xs",
                    "focus-within:ring-1 focus-within:ring-primary",
                  )}
                />

                {hasQuery ? <ResultList /> : <EmptyState />}
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

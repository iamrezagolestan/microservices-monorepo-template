"use client";

import { Copy01, Mail01, XClose } from "@untitledui/icons";
import { useCallback } from "react";
import { Button as AriaButton } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/button/button";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";

const shareTitle = "اشتراک گذاری";
const shareDescription = "میتوانید چت خود را با هوش مصنوعی به اشتراک بگذارید";
const linkLabel = "لینک";
const defaultShareLink = "olivia@untitledui.com";
const exitLabel = "خروج";
const copyLinkLabel = "کپی لینک";

export type ShareModalProps = {
  isOpen: boolean;
  link?: string;
  onOpenChange: (isOpen: boolean) => void;
};

export function ShareModal({ isOpen, link = defaultShareLink, onOpenChange }: ShareModalProps) {
  const copyLink = useCallback(() => {
    if (!navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(link).catch(() => undefined);
  }, [link]);

  return (
    <ModalOverlay isDismissable isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-tertiary shadow-xl">
        <Dialog
          aria-label={shareTitle}
          className="w-full overflow-hidden outline-hidden"
          data-testid="share-modal"
        >
          {({ close }) => (
            <div className="flex w-full flex-col items-center">
              <div className="relative flex w-full flex-col items-center pt-4">
                <div className="flex w-full flex-col gap-4 px-6 pt-6">
                  <div className="flex w-full flex-col items-end gap-0.5 text-right">
                    <h2 className="w-full text-md font-semibold text-primary">{shareTitle}</h2>
                    <p className="w-full text-sm font-regular text-tertiary">{shareDescription}</p>
                  </div>
                </div>

                <AriaButton
                  aria-label="Close share modal"
                  className="absolute left-3 top-3 flex size-11 cursor-pointer items-center justify-center rounded-md p-2 text-fg-secondary outline-focus-ring transition duration-100 ease-linear hover:bg-active hover:text-fg-secondary_hover focus-visible:ring-2 focus-visible:ring-focus-ring"
                  onPress={close}
                  type="button"
                >
                  <XClose aria-hidden="true" className="size-6" />
                </AriaButton>

                <div className="h-5 w-full shrink-0" />
              </div>

              <div className="flex w-full flex-col items-end px-6">
                <div className="flex w-full items-end justify-end gap-1">
                  <Input
                    className="w-full"
                    icon={Mail01}
                    iconPosition="trailing"
                    inputClassName="text-right text-placeholder"
                    isReadOnly
                    label={linkLabel}
                    size="lg"
                    value={link}
                    wrapperClassName={cx("bg-tertiary", "ring-primary shadow-xs")}
                  />

                  <AriaButton
                    aria-label="Copy share link"
                    className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md p-2.5 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:ring-2 focus-visible:ring-focus-ring"
                    onPress={copyLink}
                    type="button"
                  >
                    <Copy01 aria-hidden="true" className="size-5" />
                  </AriaButton>
                </div>
              </div>

              <div className="flex w-full flex-col items-start pt-8">
                <div className="h-px w-full bg-border-primary" />
                <div className="flex w-full gap-3 px-6 pb-6 pt-6">
                  <Button color="primary" onPress={copyLink} size="lg">
                    {copyLinkLabel}
                  </Button>
                  <Button color="secondary" onPress={close} size="lg">
                    {exitLabel}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

ShareModal.displayName = "ShareModal";

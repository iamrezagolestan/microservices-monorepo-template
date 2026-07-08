"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/base/button/button";
import { ShareModal } from "@/components/ui/ShareModal/ShareModal";

export function ShareModalKitchenExamples() {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <>
      <Button color="secondary" onPress={openModal} size="md">
        Open share modal
      </Button>
      <ShareModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

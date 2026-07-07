"use client";

import { useState } from "react";
import { Button } from "@/components/base/button/button";
import { SearchModal } from "@/components/ui/SearchModal/SearchModal";

export function SearchModalKitchenExamples() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <Button color="secondary" onPress={openModal} size="md">
        Open search modal
      </Button>
      <SearchModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

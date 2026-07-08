"use client";

import { useState } from "react";
import { Button } from "@/components/base/button/button";
import { SearchModal } from "@/components/ui/SearchModal/SearchModal";

export function SearchModalKitchenExamples() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button color="secondary" onPress={() => setIsOpen(true)} size="md">
        Open search modal
      </Button>
      <SearchModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

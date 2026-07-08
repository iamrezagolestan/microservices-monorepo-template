"use client";

import { useState } from "react";
import { Button } from "@/components/base/button/button";
import { SearchModal } from "@/components/ui/SearchModal/SearchModal";
import { set } from "zod/v4/mini";

export function SearchModalKitchenExamples() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="hover:bg-primary_hover w-full rounded-lg p-2">
        <button
          className={
            "flex h-7 cursor-pointer w-[120px] justify-center items-center gap-2 text-primary  transition duration-100 ease-linear"
          }
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          جستجو
        </button>
      </div>
      <SearchModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

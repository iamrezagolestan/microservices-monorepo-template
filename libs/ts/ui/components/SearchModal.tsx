import { Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../cn";
import { Button } from "./Button";
import { Input } from "./Input";

type Props = {
  className?: string;
  closeLabel?: string;
  emptyText?: ReactNode;
  inputValue?: string;
  placeholder?: string;
  results?: SearchModalResult[];
  title?: ReactNode;
  variant?: "empty" | "results";
};

type SearchModalResult = {
  id: string;
  label: string;
};

const searchIcon = <Search aria-hidden="true" className="size-full" />;
const defaultResults: SearchModalResult[] = [
  { id: "latest-1", label: "جدیدترین" },
  { id: "latest-2", label: "جدیدترین" },
  { id: "latest-3", label: "جدیدترین" },
  { id: "latest-4", label: "جدیدترین" },
];

export function SearchModal({
  className,
  closeLabel = "بستن",
  emptyText = "برای جستجو در گفت‌وگوها، عبارت مورد نظر خود را وارد کنید",
  inputValue = "جدیدترین",
  placeholder = " جستجو در گفت‌وگوها",
  results = defaultResults,
  title,
  variant = "empty",
}: Props) {
  const isResults = variant === "results";
  const resolvedTitle = title ?? (isResults ? "جستجو کنید" : undefined);

  return (
    <div
      className={cn(
        "flex w-full max-w-[640px] flex-col items-center overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--search-modal-bg)] shadow-[var(--shadow-xl)]",
        className,
      )}
      dir="rtl"
    >
      <div className="relative flex w-full flex-col items-center">
        <div className="flex w-full items-start justify-end gap-4 px-6 pt-6">
          <p
            aria-hidden={resolvedTitle ? undefined : "true"}
            className="min-h-6 w-full text-right text-base font-semibold leading-6 text-[var(--search-modal-title-fg)]"
          >
            {resolvedTitle}
          </p>
        </div>

        <Button
          aria-label={closeLabel}
          className="absolute left-3 top-3 text-[var(--search-modal-close-fg)] shadow-none hover:bg-[var(--search-modal-close-bg-hover)] focus-visible:no-underline [&>svg]:size-6"
          iconOnly
          size="lg"
          variant="ghost"
        >
          <X aria-hidden="true" />
        </Button>

        <div className="h-5 w-full" />
        <div className="h-px w-full bg-[var(--search-modal-divider)]" />
      </div>

      <div className="flex w-full flex-col items-end gap-5 px-6 pb-5 pt-5">
        <Input
          aria-label={placeholder.trim()}
          className="w-full"
          controlClassName="h-11 rounded-[var(--radius-md)] px-[14px] py-2.5"
          inputClassName={cn(
            "truncate text-base font-normal leading-6",
            isResults
              ? "text-[var(--search-modal-input-fg)]"
              : "placeholder:text-[var(--search-modal-placeholder-fg)]",
          )}
          placeholder={isResults ? undefined : placeholder}
          readOnly
          trailingIcon={searchIcon}
          trailingIconClassName="size-5 text-[var(--search-modal-search-icon-fg)]"
          value={isResults ? inputValue : undefined}
        />

        {isResults ? (
          <div className="flex w-full cursor-pointer flex-col items-start gap-2">
            {results.map((result, index) => (
              <button
                className={cn(
                  "flex w-full flex-col items-start justify-start gap-3 rounded-br-[var(--radius-xs)] rounded-tl-[var(--radius-xs)] rounded-tr-[var(--radius-xs)] py-1",
                  "transition-colors hover:bg-[var(--search-modal-close-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus-outer)]",
                )}
                key={result.id}
                type="button"
              >
                <span className="flex w-full items-center justify-start">
                  <span className="whitespace-nowrap text-right text-base font-semibold leading-6 text-[var(--search-modal-result-fg)]">
                    {result.label}
                  </span>
                </span>
                {index < results.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="h-px w-full bg-[var(--search-modal-divider)]"
                  />
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-[263px] w-full flex-col items-center justify-center gap-2 text-[var(--search-modal-empty-fg)]">
            <Search aria-hidden="true" className="size-12 stroke-[1.5]" />
            <p className="max-w-full truncate text-right text-base font-normal leading-6">
              {emptyText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

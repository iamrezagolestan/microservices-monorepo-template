"use client";

import {
  AlertCircle,
  AnnotationPlus,
  ChevronLeft,
  ChevronRight,
  ClockRewind,
  LogOut04,
  Menu01,
  SearchSm,
  XClose,
  Zap,
} from "@untitledui/icons";
import Image from "next/image";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.svg";
import { cx } from "@/utils/cx";

export type SideBarProps = {
  className?: string;
  defaultExpanded?: boolean;
  defaultHistoryOpen?: boolean;
  defaultOpen?: boolean;
  historyItems?: string[];
  tokenCount?: string;
};

const defaultHistoryItems = [
  "طبیعت زیبا، خشن و انتخاب طبیعی",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی قشنگ و در عین حال خشنه و انتخاب طبیعی هم توش وجود داره.",
  "طبیعت واقعا زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
  "طبیعت خیلی زیبا و خشنه و انتخاب طبیعی هم توش هست.",
];

type Direction = "ltr" | "rtl";

function useDocumentDirection() {
  const [direction, setDirection] = useState<Direction>("rtl");

  useEffect(() => {
    const root = document.documentElement;
    const syncDirection = () => {
      const rootDirection = root.dir || getComputedStyle(root).direction;
      setDirection(rootDirection === "ltr" ? "ltr" : "rtl");
    };
    const observer = new MutationObserver(syncDirection);

    syncDirection();
    observer.observe(root, { attributeFilter: ["dir"], attributes: true });

    return () => observer.disconnect();
  }, []);

  return direction;
}

function Logo({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className={cx("flex h-6 items-center gap-2 overflow-hidden w-full", isExpanded ? "justify-start" : "justify-center")}>
      <Image alt="logo" className="size-6 shrink-0" height={24} priority src={logo} width={24} />
      {isExpanded && (
        <p className="shrink-0 text-end text-xl font-bold text-primary">یونی پرامپت</p>
      )}
    </div>
  );
}

function TokenBadge({
  ariaLabel,
  isExpanded,
  onClick,
  tokenCount,
}: {
  ariaLabel?: string;
  isExpanded: boolean;
  onClick?: () => void;
  tokenCount: string;
}) {
  const className = cx(
    "flex h-10 items-center justify-center rounded-lg bg-primary_hover p-2",
    isExpanded ? "w-[138px] gap-2" : "w-10",
  );

  if (onClick) {
    return (
      <button
        aria-label={ariaLabel}
        className={cx(
          className,
          "cursor-pointer outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:ring-2 focus:ring-focus-ring",
        )}
        onClick={onClick}
        type="button"
      >
        <AlertCircle
          className={cx("shrink-0 text-fg-quaternary", isExpanded ? "size-6" : "size-5")}
        />
      </button>
    );
  }

  return (
    <div className={className}>
      {isExpanded && (
        <div className="flex items-center gap-1">
          <Zap className="size-4 text-fg-primary" />
          <span className="text-md font-semibold leading-6 text-primary">{tokenCount}</span>
        </div>
      )}
      <AlertCircle
        className={cx("shrink-0 text-fg-quaternary", isExpanded ? "size-6" : "size-5")}
      />
    </div>
  );
}

function IconRow({
  children,
  icon: Icon,
  isExpanded,
  onClick,
}: {
  children: string;
  icon: typeof SearchSm;
  isExpanded: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={cx(
        "flex h-7 cursor-pointer w-full justify-end items-center gap-2 text-primary  transition duration-100 ease-linear",
        isExpanded ? "justify-start" : "justify-center",
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-6 shrink-0" />
      {isExpanded && (
        <span className="whitespace-nowrap text-lg font-medium leading-7">{children}</span>
      )}
    </button>
  );
}

function HistoryList({
  activeIndex,
  historyItems,
  isExpanded,
  isHistoryOpen,
  onSelect,
}: {
  activeIndex: number;
  historyItems: string[];
  isExpanded: boolean;
  isHistoryOpen: boolean;
  onSelect: (index: number) => void;
}) {
  if (!isExpanded || !isHistoryOpen) {
    return null;
  }

  return (
    <div className="scrollbar-chatbox flex min-h-0 w-full flex-1 flex-col gap-1 overflow-y-auto pe-0.5 ps-2 [scrollbar-gutter:stable]">
      {historyItems.map((item, index) => (
        <button
          aria-current={index === activeIndex ? "page" : undefined}
          className={cx(
            "w-full cursor-pointer rounded-lg p-2 text-end text-sm font-normal leading-5 text-primary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover focus:ring-2 focus:ring-focus-ring",
            index === activeIndex && "bg-primary_hover",
          )}
          key={`${item}-${index}`}
          onClick={() => onSelect(index)}
          type="button"
        >
          <span className="block truncate">{item}</span>
        </button>
      ))}
    </div>
  );
}

function ThemeToggle({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className="flex flex-row-reverse items-center justify-start gap-2 rtl:flex-row">
      {isExpanded && <span className="text-sm font-medium leading-5 text-primary">حالت تیره</span>}
      <button
        aria-label="Toggle dark mode"
        className="flex h-5 w-9 cursor-pointer items-center justify-end rounded-full bg-alpha-black p-0.5 outline-focus-ring focus:ring-2 focus:ring-focus-ring"
        type="button"
      >
        <span className="size-4 rounded-full bg-primary shadow-sm" />
      </button>
    </div>
  );
}

function SideBarContent({
  activeHistoryIndex,
  direction,
  historyItems,
  isExpanded,
  isHistoryOpen,
  onCollapse,
  onSelectHistory,
  onToggleHistory,
  tokenCount,
}: {
  activeHistoryIndex: number;
  direction: Direction;
  historyItems: string[];
  isExpanded: boolean;
  isHistoryOpen: boolean;
  onCollapse?: () => void;
  onSelectHistory: (index: number) => void;
  onToggleHistory: () => void;
  tokenCount: string;
}) {
  return (
    <div
      className={cx(
        "relative flex h-screen min-h-0 flex-col items-center overflow-hidden bg-secondary_alt py-24",
        isExpanded ? "px-5" : "px-6",
      )}
      dir={direction}
    >
      <div
        className={cx(
          "flex min-h-0 flex-1 flex-col items-center justify-between gap-6",
          isExpanded ? "w-[216px]" : "w-8",
        )}
      >
        <div
          className={cx(
            "flex min-h-0 flex-1 flex-col items-end",
            isExpanded ? "w-full gap-10" : "gap-10",
          )}
        >
          <Logo isExpanded={isExpanded} />

          <div
            className={cx(
              "flex flex-row items-center rtl:flex-row-reverse",
              isExpanded ? "w-full justify-between" : "justify-center",
            )}
          >
            {onCollapse && (
              <>
                {isExpanded ? (
                  <button
                    aria-label="Collapse sidebar"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-primary_hover text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:ring-2 focus:ring-focus-ring"
                    onClick={onCollapse}
                    type="button"
                  >
                    {direction === "rtl" ? (
                      <ChevronRight className="size-4" />
                    ) : (
                      <ChevronLeft className="size-4" />
                    )}
                  </button>
                ) : (
                  <TokenBadge
                    ariaLabel="Extend sidebar"
                    isExpanded={false}
                    onClick={onCollapse}
                    tokenCount={tokenCount}
                  />
                )}
              </>
            )}
            {isExpanded && <TokenBadge isExpanded={true} tokenCount={tokenCount} />}
            {!isExpanded && !onCollapse && (
              <TokenBadge isExpanded={false} tokenCount={tokenCount} />
            )}
          </div>

          <div
            className={cx(
              "flex min-h-0 flex-1 flex-col items-end gap-6",
              isExpanded ? "w-full" : "w-8",
            )}
          >
            <div className="h-px w-[190px] max-w-full shrink-0 bg-border-secondary" />
            <div
              className={cx(
                "flex shrink-0 flex-col gap-2",
                isExpanded ? "w-full items-start" : "items-center",
              )}
            >
              <div className="hover:bg-primary_hover w-full rounded-lg p-2">
                <IconRow icon={SearchSm} isExpanded={isExpanded}>
                  جستجو
                </IconRow>
              </div>
              <div className="hover:bg-primary_hover w-full rounded-lg p-2">
                <IconRow icon={AnnotationPlus} isExpanded={isExpanded}>
                  ایجاد چت
                </IconRow>
              </div>
              <div
                className={cx(
                  "flex items-center",
                  isExpanded ? "w-full justify-between" : "justify-center",
                )}
              >
                <div className="hover:bg-primary_hover w-full rounded-lg p-2 flex flex-row justify-between items-center">
                  <IconRow icon={ClockRewind} isExpanded={isExpanded} onClick={onToggleHistory}>
                    سابقه چت
                  </IconRow>
                  {isExpanded && (
                    <button
                      aria-label={isHistoryOpen ? "Close chat history" : "Open chat history"}
                      className="flex size-4 cursor-pointer items-center justify-center text-fg-quaternary"
                      onClick={onToggleHistory}
                      type="button"
                    >
                      {isHistoryOpen ? (
                        <ChevronRight className="size-4 -rotate-90" />
                      ) : (
                        <ChevronRight className="size-4 rotate-90" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <HistoryList
              activeIndex={activeHistoryIndex}
              historyItems={historyItems}
              isExpanded={isExpanded}
              isHistoryOpen={isHistoryOpen}
              onSelect={onSelectHistory}
            />
          </div>
        </div>

        <div
          className={cx(
            "flex h-8 shrink-0 items-center",
            isExpanded ? "w-full justify-between" : "justify-center",
          )}
        >
          {isExpanded && (
            <button
              className="flex cursor-pointer flex-row-reverse items-center gap-1 text-sm font-medium leading-5 text-tertiary outline-focus-ring hover:text-secondary_hover focus:ring-2 focus:ring-focus-ring rtl:flex-row"
              type="button"
            >
              <span>خروج</span>
              <LogOut04 className="size-4" />
            </button>
          )}
          <ThemeToggle isExpanded={isExpanded} />
        </div>
      </div>
    </div>
  );
}

export function SideBar({
  className,
  defaultExpanded = true,
  defaultHistoryOpen = true,
  defaultOpen = false,
  historyItems = defaultHistoryItems,
  tokenCount = "۲۵۰۰",
}: SideBarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isHistoryOpen, setIsHistoryOpen] = useState(defaultHistoryOpen);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);
  const direction = useDocumentDirection();
  const isRtl = direction === "rtl";

  return (
    <div
      className={cx(
        "relative flex h-screen min-h-0 w-full bg-bg-primary md:w-auto",
        isRtl ? "md:justify-end" : "md:justify-start",
        className,
      )}
      dir={direction}
    >

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close sidebar backdrop"
            className="absolute inset-0 cursor-default bg-alpha-black/40"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <aside
            className={cx(
              "relative z-10 h-screen w-64 border-e border-secondary shadow-xl",
              isRtl ? "ms-auto" : "me-auto",
            )}
          >
            <button
              aria-label="Close sidebar"
              className="absolute start-4 top-4 z-10 flex size-9 cursor-pointer items-center justify-center rounded-lg text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus:ring-2 focus:ring-focus-ring"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <XClose className="size-5" />
            </button>
            <SideBarContent
              activeHistoryIndex={activeHistoryIndex}
              direction={direction}
              historyItems={historyItems}
              isExpanded={true}
              isHistoryOpen={isHistoryOpen}
              onSelectHistory={setActiveHistoryIndex}
              onToggleHistory={() => setIsHistoryOpen((current) => !current)}
              tokenCount={tokenCount}
            />
          </aside>
        </div>
      )}

      <aside
        className={cx(
          "hidden h-screen min-h-0 overflow-hidden border-e border-secondary transition-[width] duration-200 ease-linear md:block",
          isExpanded ? "w-64" : "w-20",
        )}
        data-state={isExpanded ? "expanded" : "collapsed"}
      >
        <SideBarContent
          activeHistoryIndex={activeHistoryIndex}
          direction={direction}
          historyItems={historyItems}
          isExpanded={isExpanded}
          isHistoryOpen={isHistoryOpen}
          onCollapse={() => setIsExpanded((current) => !current)}
          onSelectHistory={setActiveHistoryIndex}
          onToggleHistory={() => setIsHistoryOpen((current) => !current)}
          tokenCount={tokenCount}
        />
      </aside>
    </div>
  );
}

SideBar.displayName = "SideBar";

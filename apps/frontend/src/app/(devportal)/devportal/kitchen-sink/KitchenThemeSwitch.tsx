"use client";

import { Moon01, Sun } from "@untitledui/icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

export function KitchenThemeSwitch() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <Button
      aria-checked={isDark}
      aria-label="Toggle dark theme"
      className="gap-2 cursor-pointer p-2 hover:bg-alpha-black hover:text-alpha-white fixed left-1 bottom-[50%] w-30"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="switch"
      variant="secondary"
    >
      <div className="flex flex-row flex-nowrap items-center gap-5">
        <div>
          {isDark ? <Moon01 aria-hidden="true" size={16} /> : <Sun aria-hidden="true" size={16} />}
        </div>
        <div>
          <span>{isDark ? "Dark" : "Light"}</span>
        </div>
      </div>
    </Button>
  );
}

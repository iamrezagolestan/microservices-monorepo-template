"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

export function KitchenThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      aria-checked={isDark}
      aria-label="Toggle dark theme"
      className="gap-2 cursor-pointer p-2 hover:bg-alpha-black hover:text-alpha-white"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="switch"
      variant="secondary"
    >
      {isDark ? <Moon aria-hidden="true" size={16} /> : <Sun aria-hidden="true" size={16} />}
      <span>{isDark ? "Dark" : "Light"}</span>
    </Button>
  );
}

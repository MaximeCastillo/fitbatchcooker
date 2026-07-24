"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { strings } from "@/lib/strings";

// Three-way segmented control: light / dark / system. We compare against
// next-themes' `theme` (the user's chosen setting) rather than `resolvedTheme`
// so the "Système" option can stay selected while following the OS.
const options = [
  { value: "light", label: strings.account.themeLight, Icon: Sun },
  { value: "dark", label: strings.account.themeDark, Icon: Moon },
  { value: "system", label: strings.account.themeSystem, Icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // The active theme is only known on the client (it lives in localStorage / the
  // OS), so we defer rendering the selected state until after hydration to avoid
  // an SSR/client mismatch. useSyncExternalStore returns the server snapshot
  // (false) during render and the client snapshot (true) once mounted — the
  // hydration-safe equivalent of the classic next-themes `mounted` flag.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div
      role="radiogroup"
      aria-label={strings.account.appearanceSection}
      className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1"
    >
      {options.map(({ value, label, Icon }) => {
        const isActive = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(value)}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

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

// `compact` = icon-only single row (for the tight mobile header); default = a labelled
// 3-column segmented control (for the desktop sidebar footer).
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
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
      className={cn(
        "bg-muted/60",
        compact
          ? "flex gap-0.5 rounded-lg p-0.5"
          : "grid grid-cols-3 gap-1 rounded-xl p-1",
      )}
    >
      {options.map(({ value, label, Icon }) => {
        const isActive = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={compact ? label : undefined}
            onClick={() => setTheme(value)}
            className={cn(
              "outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              compact
                ? "grid size-9 place-items-center rounded-md"
                : "flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {!compact && label}
          </button>
        );
      })}
    </div>
  );
}

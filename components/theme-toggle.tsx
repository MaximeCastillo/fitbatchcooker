"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

// Simple light/dark toggle (a control, not a 3-way setting): one small icon button
// that flips between the two — compact enough for the shell chrome on both desktop
// and mobile. The icon shows the theme you'll switch TO (moon = go dark, sun = go
// light). We use `resolvedTheme` so it works even if the stored value is "system".
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("account");

  // The active theme lives client-side (localStorage / OS), so defer the icon/state
  // until after hydration to avoid an SSR mismatch. useSyncExternalStore returns the
  // server snapshot (false) during render, the client one (true) once mounted.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("themeToLight") : t("themeToDark")}
      className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  );
}

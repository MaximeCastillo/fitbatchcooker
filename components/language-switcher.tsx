"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Compact FR/EN switcher for the shell chrome (next to the theme toggle). It navigates
// to the SAME path in the other locale via next-intl's locale-aware router, which also
// updates the NEXT_LOCALE cookie so the choice sticks. A control, not a nav item.
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function switchTo(nextLocale: string) {
    if (nextLocale === locale) return;
    // usePathname is locale-stripped, so we just re-render the current path in the
    // target locale.
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div
      role="group"
      aria-label={t("changeLanguage")}
      className="flex items-center gap-0.5 rounded-md border p-0.5"
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchTo(loc)}
            disabled={isPending}
            aria-pressed={active}
            className={cn(
              "grid h-8 min-w-8 place-items-center rounded px-1.5 text-xs font-bold uppercase transition-colors disabled:opacity-50",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {loc}
          </button>
        );
      })}
    </div>
  );
}

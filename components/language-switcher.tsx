"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// A single toggle (like the theme toggle) for the shell chrome: it shows the language
// you'll switch TO (in French it reads "EN", in English "FR") and flips on click. For
// two locales this is lighter and more familiar than a two-button pill.
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const nextLocale = locale === "fr" ? "en" : "fr";

  function toggle() {
    startTransition(() => {
      // localePrefix "never": the URL doesn't change, so `replace` only writes the
      // NEXT_LOCALE cookie — Server Components (navbar, etc.) won't re-render on their
      // own. `refresh()` forces a fresh RSC request that re-runs the middleware, which
      // reads the new cookie and re-renders everything in the target locale.
      router.replace(pathname, { locale: nextLocale });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={t("changeLanguage")}
      title={t("changeLanguage")}
      className={cn(
        "grid h-9 min-w-9 place-items-center rounded-md px-1.5 text-xs font-bold uppercase text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
      )}
    >
      {nextLocale}
    </button>
  );
}

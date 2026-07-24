"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Localized 404, rendered inside the [locale] layout (so it inherits the shell, fonts
// and providers). Shown for not-found paths UNDER a locale — e.g. /en/nope, or a
// notFound() thrown by a page (a recipe/batch that doesn't exist) — so English users
// get English. A Client Component using `useTranslations`: it reads the locale from
// the layout's NextIntlClientProvider, which is reliably present here (the server-side
// getTranslations lacks a locale context inside not-found and falls back to the root).
// The root app/not-found.tsx stays the fallback for paths that never resolved to a locale.
export default function LocaleNotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t("home")}
      </Link>
    </main>
  );
}

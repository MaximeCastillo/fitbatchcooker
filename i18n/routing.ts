import { defineRouting } from "next-intl/routing";

// Central routing config: the supported locales and how they map onto URLs.
// `localePrefix: "never"` → the locale is NEVER in the URL (clean URLs everywhere,
// YouTube-style). The middleware picks the locale from the `NEXT_LOCALE` cookie and the
// visitor's `Accept-Language` (device language) and rewrites to the internal `[locale]`
// segment — so a French device lands in French automatically, at the same clean URLs.
// Default English (the pivot language). Precedence: cookie choice > device > default.
// Trade-off (accepted for now): weaker per-language SEO / no shareable language links —
// switch to "as-needed" if that ever matters (e.g. a marketing landing).
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "en",
  localePrefix: "never",
});

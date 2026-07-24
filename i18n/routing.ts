import { defineRouting } from "next-intl/routing";

// Central routing config: the supported locales and how they map onto URLs.
// `localePrefix: "as-needed"` keeps the default locale (fr) on clean URLs (`/batch`)
// while prefixing the others (`/en/batch`).
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

import { notFound } from "next/navigation";

// Catch-all under [locale]: Next only renders `[locale]/not-found.tsx` when a component
// calls notFound() — NOT for arbitrary unmatched URLs (those hit the ROOT not-found).
// This catch-all matches any unmatched path under a locale and calls notFound(), so the
// LOCALIZED 404 shows (English under /en, French under /fr). Real routes (batch,
// recipes, …) match first and never reach this. The next-intl recommended pattern.
export default function CatchAllNotFound() {
  notFound();
}

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

// Suspense fallback for /ingredients. Mirrors the real page — title, the count subtitle,
// search bar, category chips, then the card grid — so only the placeholders swap out when
// the catalog resolves. Only the first window of cards is drawn: that's all the real list
// renders too (infinite scroll reveals the rest).

// Rough width of each category chip, in label order (Tous + the ten categories).
const CHIP_WIDTHS = [
  "w-16",
  "w-24",
  "w-24",
  "w-24",
  "w-36",
  "w-24",
  "w-20",
  "w-32",
  "w-32",
  "w-28",
  "w-20",
];

export default function Loading() {
  const t = useTranslations("ingredients");
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>

      {/* count · protein basis */}
      <Skeleton className="mb-6 mt-1 h-5 w-64" />

      {/* search bar */}
      <Skeleton className="mb-3 h-[38px] w-full rounded-lg" />

      {/* category chips — one per catalog category, so they wrap onto the same two rows
          the real chips do and the grid below doesn't jump when the data lands */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {CHIP_WIDTHS.map((width, index) => (
          <Skeleton key={index} className={`h-9 ${width} rounded-full`} />
        ))}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <li key={index}>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
              <Skeleton className="size-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

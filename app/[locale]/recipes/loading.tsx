import { useTranslations } from "next-intl";
import { RecipeGridSkeleton } from "@/components/recipe-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Suspense fallback for /recipes. Mirrors the real page's layout — title + "new recipe"
// button, search bar, filter chips, then the recipe grid — so nothing shifts (and the
// title stays in place) when the data resolves.
export default function Loading() {
  const t = useTranslations("recipes");
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* search bar */}
      <Skeleton className="mb-3 h-[38px] w-full rounded-lg" />

      {/* filter chips (meal-type tabs + favorites) */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <Skeleton className="h-9 w-14 rounded-full" />
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      <RecipeGridSkeleton />
    </main>
  );
}

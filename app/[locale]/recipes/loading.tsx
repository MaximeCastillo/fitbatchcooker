import { useTranslations } from "next-intl";
import { RecipeGridSkeleton } from "@/components/recipe-grid-skeleton";

// Shown automatically by Next (Suspense) while RecipesPage fetches its data.
export default function Loading() {
  const t = useTranslations("recipes");
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{t("title")}</h1>
      <RecipeGridSkeleton />
    </main>
  );
}

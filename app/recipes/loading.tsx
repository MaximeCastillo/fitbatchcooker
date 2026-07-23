import { RecipeGridSkeleton } from "@/components/recipe-grid-skeleton";
import { strings } from "@/lib/strings";

// Shown automatically by Next (Suspense) while RecipesPage fetches its data.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        {strings.recipes.title}
      </h1>
      <RecipeGridSkeleton />
    </main>
  );
}

import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { loadRecipes } from "./actions";
import { parseRecipeFilters, type RecipeQuery } from "./filter-params";
import { RecipeBrowser } from "@/components/recipe-browser";

// Render on each request: recipes + per-user saved state change over time.
export const dynamic = "force-dynamic";

// The single Recipes page: everything the user may see (shared library + their own),
// filterable (search, meal types, Favorites). Filters live in the URL query so opening a
// recipe and coming back restores them. Create a recipe from here.
export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<RecipeQuery>;
}) {
  const t = await getTranslations("recipes");
  const user = await getCurrentUser();

  const filters = parseRecipeFilters(await searchParams);
  const { recipes, nextCursor } = await loadRecipes(filters, null);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        {user && (
          <Link
            href="/recipes/new"
            className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" aria-hidden />
            {t("new")}
          </Link>
        )}
      </div>
      <RecipeBrowser
        initialRecipes={recipes}
        initialNextCursor={nextCursor}
        canSave={user != null}
        initialFilters={filters}
      />
    </main>
  );
}

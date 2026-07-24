import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { loadRecipes } from "./actions";
import { RecipeBrowser } from "@/components/recipe-browser";

// Render on each request: the library grows and saved state is per-user.
export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const t = await getTranslations("recipes");
  const user = await getCurrentUser();
  // Page 1 with default filters; the browser loads more + refetches on filter change.
  const { recipes, nextCursor } = await loadRecipes({}, null);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{t("title")}</h1>
      <RecipeBrowser
        initialRecipes={recipes}
        initialNextCursor={nextCursor}
        showMine={user != null}
      />
    </main>
  );
}

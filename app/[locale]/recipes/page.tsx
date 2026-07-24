import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
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
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        {user && (
          <Link
            href="/recipes/new"
            className="flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" aria-hidden />
            {t("new")}
          </Link>
        )}
      </div>
      <RecipeBrowser
        initialRecipes={recipes}
        initialNextCursor={nextCursor}
        showMine={user != null}
      />
    </main>
  );
}

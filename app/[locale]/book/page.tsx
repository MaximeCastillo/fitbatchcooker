import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { RecipeBrowser } from "@/components/recipe-browser";
import { loadRecipes } from "@/app/[locale]/recipes/actions";
import { Link, redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

// The user's personal recipe book: recipes they saved (bookmarked shared ones + their
// own auto-saved creations). Where you create a new recipe — the shared library is
// read-only. Same filters as the browse page (scope="book"). This is also the source of
// the batch composer's palette.
export default async function BookPage() {
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale: await getLocale() });

  const t = await getTranslations("book");
  const tr = await getTranslations("recipes");
  const { recipes, nextCursor } = await loadRecipes({ scope: "book" }, null);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <Link
          href="/recipes/new"
          className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" aria-hidden />
          {tr("new")}
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-muted-foreground">{t("empty")}</p>
          <Button render={<Link href="/recipes" />} nativeButton={false}>
            {t("browse")}
          </Button>
        </div>
      ) : (
        <RecipeBrowser
          initialRecipes={recipes}
          initialNextCursor={nextCursor}
          scope="book"
          canSave
        />
      )}
    </main>
  );
}

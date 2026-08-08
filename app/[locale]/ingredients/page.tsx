import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { IngredientBrowser } from "@/components/ingredient-browser";

export const dynamic = "force-dynamic";

// The global ingredient catalog (shared, read-only — it's a locked curated set fed by the
// seed). Tapping an ingredient opens the recipes that use it (reverse search).
export default async function IngredientsPage() {
  const t = await getTranslations("ingredients");
  const locale = await getLocale();
  const [user, ingredients] = await Promise.all([
    getCurrentUser(),
    prisma.ingredient.findMany({
      // Sort in Postgres, just on the reader's column. Category keeps its ENUM
      // declaration order (what `category: "asc"` already means) — re-sorting in JS with
      // localeCompare would silently turn it alphabetical and reshuffle the filter chips.
      orderBy: [
        { category: "asc" },
        locale === "fr" ? { nameFr: "asc" } : { nameEn: "asc" },
      ],
      select: {
        id: true,
        nameFr: true,
        nameEn: true,
        category: true,
        proteinPer100g: true,
        picto: true,
      },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        {t("count", { count: ingredients.length })} · {t("proteinBasis")}
      </p>
      <IngredientBrowser ingredients={ingredients} canSave={user != null} />
    </main>
  );
}

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { IngredientBrowser } from "@/components/ingredient-browser";

// Render on each request: the shared catalog grows as the chef/users create ingredients.
export const dynamic = "force-dynamic";

// The global ingredient catalog (shared by everyone). Read-only browse for now — editing
// an ingredient's protein is a fast-follow (it's shared, so it has cross-user impact).
export default async function IngredientsPage() {
  const t = await getTranslations("ingredients");
  const ingredients = await prisma.ingredient.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true, proteinPer100g: true },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        {t("count", { count: ingredients.length })}
      </p>
      <IngredientBrowser ingredients={ingredients} />
    </main>
  );
}

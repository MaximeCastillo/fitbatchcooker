import { prisma } from "@/lib/prisma";
import { recipeProteinG } from "@/lib/nutrition";

// Visibility (authorization): a user sees the shared library (userId = NULL) PLUS their
// own recipes. Anonymous visitors see only the shared library. Use this in every recipe
// query so ownership is enforced server-side (spec §7).
export function recipeVisibilityWhere(userId: string | null | undefined) {
  return userId ? { OR: [{ userId: null }, { userId }] } : { userId: null };
}

// The two models recomputeRecipeProtein touches — lets callers pass either the global
// `prisma` client or a `$transaction` client.
type RecipeDb = Pick<typeof prisma, "recipeIngredient" | "recipe">;

// Recompute + persist a recipe's cached protein-per-part from its ingredients. MUST be
// called (in the same transaction) by any write that changes a recipe's ingredients —
// create today, edit later — so the batch composer's cached `proteinPerServingG` column
// never goes stale. Returns the new value.
export async function recomputeRecipeProtein(
  recipeId: string,
  db: RecipeDb = prisma,
): Promise<number> {
  const links = await db.recipeIngredient.findMany({
    where: { recipeId },
    select: {
      quantityG: true,
      ingredient: { select: { proteinPer100g: true } },
    },
  });
  const proteinPerServingG = recipeProteinG(
    links.map((link) => ({
      proteinPer100g: link.ingredient.proteinPer100g,
      quantityG: link.quantityG,
    })),
  );
  await db.recipe.update({
    where: { id: recipeId },
    data: { proteinPerServingG },
  });
  return proteinPerServingG;
}

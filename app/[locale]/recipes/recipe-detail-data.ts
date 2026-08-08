import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ingredientName } from "@/lib/ingredients";

// Shared server-side fetch for a recipe's detail (used by the /recipes/[id] page).
// Visibility-scoped: a recipe is readable only if it's shared (userId null) or the
// current user's own. Returns null when it doesn't exist or isn't visible (caller
// calls notFound()).
export async function getRecipeDetailData(id: string) {
  const [recipe, user, locale] = await Promise.all([
    prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: {
              select: {
                nameFr: true,
                nameEn: true,
                category: true,
                picto: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    getCurrentUser(),
    getLocale(),
  ]);

  if (!recipe || (recipe.userId && recipe.userId !== user?.id)) return null;

  const isSaved = user
    ? (await prisma.userRecipe.findUnique({
        where: { userId_recipeId: { userId: user.id, recipeId: recipe.id } },
        select: { id: true },
      })) != null
    : false;

  return {
    id: recipe.id,
    title: recipe.title,
    canSave: user != null,
    isSaved,
    detail: {
      summary: recipe.summary,
      mealType: recipe.mealType,
      proteinPerServingG: recipe.proteinPerServingG,
      caloriesPerServingKcal: recipe.caloriesPerServingKcal,
      steps: recipe.steps,
      // Resolve the bilingual catalog down to ONE name here, so RecipeDetail (shared by
      // the detail page and the batch preview modal) keeps taking a plain `name`.
      ingredients: recipe.ingredients.map((link) => ({
        name: ingredientName(link.ingredient, locale),
        category: link.ingredient.category,
        picto: link.ingredient.picto,
        quantityG: link.quantityG,
      })),
    },
  };
}

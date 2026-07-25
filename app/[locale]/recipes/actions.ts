"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recipeVisibilityWhere, recomputeRecipeProtein } from "@/lib/recipes";
import { redirect } from "@/i18n/navigation";
import type { MealType } from "@/lib/generated/prisma/enums";

// Shape a recipe card needs (a "use server" module may only export async functions +
// types — types are erased, so these are fine here).
export type RecipeCardData = {
  id: string;
  title: string;
  summary: string | null;
  mealType: MealType;
  proteinPerServingG: number | null;
  caloriesPerServingKcal: number | null;
  imageUrl: string | null;
  saved: boolean;
};

// One recipe list, scoped to what the user may see: the shared library (userId = null) +
// their own recipes (never another user's). `favoritesOnly` narrows to what they saved
// (the bookmark). Single page `/recipes` with a Favorites filter; the batch palette uses
// the same query.
export type RecipeFilters = {
  search?: string;
  mealType?: MealType | null;
  favoritesOnly?: boolean;
};

const RECIPES_PAGE_SIZE = 12;
// Never-matching sentinel: anonymous users have no saved rows.
const NO_USER = "00000000-0000-0000-0000-000000000000";

// Cursor-paginated, filtered, visibility-scoped recipe list — powers the browse infinite
// scroll. Same query path for filtering + paging: filters build the `where`, the cursor
// (last id of the previous page) + take(N+1) yield the page and next cursor.
export async function loadRecipes(
  filters: RecipeFilters,
  cursor: string | null,
): Promise<{ recipes: RecipeCardData[]; nextCursor: string | null }> {
  const user = await getCurrentUser();
  const userId = user?.id ?? NO_USER;

  const rows = await prisma.recipe.findMany({
    where: {
      AND: [
        recipeVisibilityWhere(user?.id), // public + own, never another user's
        ...(filters.favoritesOnly ? [{ savedBy: { some: { userId } } }] : []),
        ...(filters.mealType ? [{ mealType: filters.mealType }] : []),
        ...(filters.search?.trim()
          ? [{ title: { contains: filters.search.trim(), mode: "insensitive" as const } }]
          : []),
      ],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: RECIPES_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      summary: true,
      mealType: true,
      proteinPerServingG: true,
      caloriesPerServingKcal: true,
      imageUrl: true,
      // Empty for anonymous (the sentinel never matches a real user); one row if the
      // current user saved (favorited) it.
      savedBy: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  const hasMore = rows.length > RECIPES_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, RECIPES_PAGE_SIZE) : rows;
  const recipes: RecipeCardData[] = page.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    mealType: r.mealType,
    proteinPerServingG: r.proteinPerServingG,
    caloriesPerServingKcal: r.caloriesPerServingKcal,
    imageUrl: r.imageUrl,
    saved: r.savedBy.length > 0,
  }));

  return { recipes, nextCursor: hasMore ? page[page.length - 1].id : null };
}

// Reverse search (Marmiton-style): recipes that USE a given ingredient, among those the
// user can see (shared library + their own). Cursor-paginated for the ingredient modal's
// infinite scroll; carries per-user saved state for the bookmark toggle.
export async function loadRecipesByIngredient(
  ingredientId: string,
  cursor: string | null,
): Promise<{ recipes: RecipeCardData[]; nextCursor: string | null }> {
  const user = await getCurrentUser();
  const userId = user?.id ?? NO_USER;

  const rows = await prisma.recipe.findMany({
    where: {
      AND: [
        recipeVisibilityWhere(user?.id),
        { ingredients: { some: { ingredientId } } },
      ],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: RECIPES_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      summary: true,
      mealType: true,
      proteinPerServingG: true,
      caloriesPerServingKcal: true,
      imageUrl: true,
      savedBy: { where: { userId }, select: { id: true } },
    },
  });

  const hasMore = rows.length > RECIPES_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, RECIPES_PAGE_SIZE) : rows;
  const recipes: RecipeCardData[] = page.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    mealType: r.mealType,
    proteinPerServingG: r.proteinPerServingG,
    caloriesPerServingKcal: r.caloriesPerServingKcal,
    imageUrl: r.imageUrl,
    saved: r.savedBy.length > 0,
  }));

  return { recipes, nextCursor: hasMore ? page[page.length - 1].id : null };
}

// Save/unsave a recipe to the current user's book. Every query is scoped to the
// logged-in user's id — this is our authorization model (spec §7): a user can only
// ever touch their own rows.
export async function toggleSaveRecipe(recipeId: string) {
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale: await getLocale() });
  if (!recipeId) return;

  const existing = await prisma.userRecipe.findUnique({
    where: { userId_recipeId: { userId: user.id, recipeId } },
  });

  if (existing) {
    await prisma.userRecipe.delete({ where: { id: existing.id } });
  } else {
    await prisma.userRecipe.create({ data: { userId: user.id, recipeId } });
  }

  // Refresh the page that shows saved state.
  revalidatePath("/recipes");
}

// Create a recipe owned by the current user from the manual form. Ingredients are
// already resolved to ids by the picker (existing or just-created). Recompute the cached
// protein/part in the same transaction. Redirects to the new recipe on success.
export async function createRecipe(input: {
  title: string;
  mealType: MealType;
  steps: string[];
  ingredients: { ingredientId: string; quantityG: number }[];
}): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale: await getLocale() });

  const title = input.title.trim();
  const steps = input.steps.map((s) => s.trim()).filter(Boolean);
  // Merge duplicate ingredients (one row per ingredient — @@unique([recipeId, ingredientId])).
  const merged = new Map<string, number>();
  for (const link of input.ingredients) {
    if (link.ingredientId && link.quantityG > 0) {
      merged.set(link.ingredientId, (merged.get(link.ingredientId) ?? 0) + link.quantityG);
    }
  }
  if (!title || steps.length === 0 || merged.size === 0) {
    throw new Error("Recipe needs a title, at least one step and one ingredient.");
  }

  const recipe = await prisma.$transaction(async (tx) => {
    const created = await tx.recipe.create({
      data: {
        userId: user.id,
        title,
        mealType: input.mealType,
        steps,
        ingredients: {
          create: [...merged].map(([ingredientId, quantityG]) => ({
            ingredientId,
            quantityG,
          })),
        },
        // Auto-save into the author's book so it appears in "My recipes" + the batch
        // palette right away (the two are the same list now).
        savedBy: { create: { userId: user.id } },
      },
      select: { id: true },
    });
    await recomputeRecipeProtein(created.id, tx);
    return created;
  });

  revalidatePath("/recipes");
  redirect({ href: `/recipes/${recipe.id}`, locale: await getLocale() });
}

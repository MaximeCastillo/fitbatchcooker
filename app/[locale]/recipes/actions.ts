"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recipeVisibilityWhere } from "@/lib/recipes";
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

export type RecipeFilters = {
  search?: string;
  mealType?: MealType | null;
  mine?: boolean;
};

const RECIPES_PAGE_SIZE = 12;

// Cursor-paginated, filtered, user-scoped recipe list — powers the browse page's
// infinite scroll. Same query path for filtering + paging: filters build the `where`,
// the cursor (last id of the previous page) + take(N+1) yield the page and next cursor.
export async function loadRecipes(
  filters: RecipeFilters,
  cursor: string | null,
): Promise<{ recipes: RecipeCardData[]; nextCursor: string | null }> {
  const user = await getCurrentUser();
  const base =
    filters.mine && user
      ? { userId: user.id }
      : recipeVisibilityWhere(user?.id);

  const rows = await prisma.recipe.findMany({
    where: {
      AND: [
        base,
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
      // Empty for anonymous (the all-zero UUID never matches a real user); one row if
      // the current user saved it.
      savedBy: {
        where: { userId: user?.id ?? "00000000-0000-0000-0000-000000000000" },
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

  // Refresh the pages that show saved state.
  revalidatePath("/recipes");
  revalidatePath("/book");
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Save/unsave a recipe to the current user's book. Every query is scoped to the
// logged-in user's id — this is our authorization model (spec §7): a user can only
// ever touch their own rows.
export async function toggleSaveRecipe(formData: FormData) {
  const recipeId = String(formData.get("recipeId") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect("/login");
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
}

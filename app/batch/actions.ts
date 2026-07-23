"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { strings } from "@/lib/strings";

// All actions are scoped to the logged-in user (authorization — spec §7): we never
// touch a plan or entry that isn't owned by the current user.

async function requireUserId() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user.id;
}

// Returns the plan only if it belongs to this user, else null.
async function ownedPlan(planId: string, userId: string) {
  return prisma.mealPlan.findFirst({ where: { id: planId, userId } });
}

// Returns the entry (with its plan) only if its plan belongs to this user, else null.
async function ownedEntry(entryId: string, userId: string) {
  return prisma.planEntry.findFirst({
    where: { id: entryId, mealPlan: { userId } },
    include: { mealPlan: true },
  });
}

function revalidateBatch(planId: string) {
  revalidatePath("/batch");
  revalidatePath(`/batch/${planId}`);
}

// --- Plans ------------------------------------------------------------------

export async function createBatch() {
  const userId = await requireUserId();
  const label = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
  const plan = await prisma.mealPlan.create({
    data: { userId, name: strings.batch.defaultName(label), dayCount: 5 },
  });
  revalidatePath("/batch");
  redirect(`/batch/${plan.id}`);
}

export async function renameBatch(planId: string, name: string) {
  const userId = await requireUserId();
  if (!(await ownedPlan(planId, userId))) return;
  const clean = name.trim().slice(0, 80) || strings.batch.untitled;
  await prisma.mealPlan.update({ where: { id: planId }, data: { name: clean } });
  revalidateBatch(planId);
}

export async function deleteBatch(planId: string) {
  const userId = await requireUserId();
  if (!(await ownedPlan(planId, userId))) return;
  await prisma.mealPlan.delete({ where: { id: planId } }); // cascades to entries
  revalidatePath("/batch");
  redirect("/batch");
}

// --- Days -------------------------------------------------------------------

export async function addDay(planId: string) {
  const userId = await requireUserId();
  if (!(await ownedPlan(planId, userId))) return;
  await prisma.mealPlan.update({
    where: { id: planId },
    data: { dayCount: { increment: 1 } },
  });
  revalidateBatch(planId);
}

export async function removeDay(planId: string, dayIndex: number) {
  const userId = await requireUserId();
  const plan = await ownedPlan(planId, userId);
  if (!plan || plan.dayCount <= 1) return;

  // Only remove an empty day, then shift later days down to keep indexes contiguous.
  const onThatDay = await prisma.planEntry.count({
    where: { mealPlanId: planId, dayIndex },
  });
  if (onThatDay > 0) return;

  await prisma.$transaction([
    prisma.planEntry.updateMany({
      where: { mealPlanId: planId, dayIndex: { gt: dayIndex } },
      data: { dayIndex: { decrement: 1 } },
    }),
    prisma.mealPlan.update({
      where: { id: planId },
      data: { dayCount: { decrement: 1 } },
    }),
  ]);
  revalidateBatch(planId);
}

// --- Entries ----------------------------------------------------------------

export async function addEntry(
  planId: string,
  dayIndex: number,
  recipeId: string,
) {
  const userId = await requireUserId();
  const plan = await ownedPlan(planId, userId);
  if (!plan || dayIndex < 0 || dayIndex >= plan.dayCount) return;

  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) return;

  await prisma.planEntry.create({
    data: { mealPlanId: planId, recipeId, dayIndex, servings: 1 },
  });
  revalidateBatch(planId);
}

export async function moveEntry(entryId: string, toDayIndex: number) {
  const userId = await requireUserId();
  const entry = await ownedEntry(entryId, userId);
  if (!entry || toDayIndex < 0 || toDayIndex >= entry.mealPlan.dayCount) return;

  await prisma.planEntry.update({
    where: { id: entryId },
    data: { dayIndex: toDayIndex },
  });
  revalidateBatch(entry.mealPlanId);
}

export async function duplicateEntry(entryId: string, toDayIndex: number) {
  const userId = await requireUserId();
  const entry = await ownedEntry(entryId, userId);
  if (!entry || toDayIndex < 0 || toDayIndex >= entry.mealPlan.dayCount) return;

  await prisma.planEntry.create({
    data: {
      mealPlanId: entry.mealPlanId,
      recipeId: entry.recipeId,
      dayIndex: toDayIndex,
      servings: entry.servings,
    },
  });
  revalidateBatch(entry.mealPlanId);
}

export async function removeEntry(entryId: string) {
  const userId = await requireUserId();
  const entry = await ownedEntry(entryId, userId);
  if (!entry) return;
  await prisma.planEntry.delete({ where: { id: entryId } });
  revalidateBatch(entry.mealPlanId);
}

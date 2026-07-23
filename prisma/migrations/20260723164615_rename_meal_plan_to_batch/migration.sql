-- Rename MealPlan -> Batch and PlanEntry -> BatchEntry, preserving data.
-- Hand-written RENAME migration (Prisma would otherwise DROP + CREATE = data loss).

ALTER TABLE "MealPlan" RENAME TO "Batch";
ALTER TABLE "PlanEntry" RENAME TO "BatchEntry";

-- Rename the foreign-key column mealPlanId -> batchId.
ALTER TABLE "BatchEntry" RENAME COLUMN "mealPlanId" TO "batchId";

-- Rename primary keys to match the new model names.
ALTER TABLE "Batch" RENAME CONSTRAINT "MealPlan_pkey" TO "Batch_pkey";
ALTER TABLE "BatchEntry" RENAME CONSTRAINT "PlanEntry_pkey" TO "BatchEntry_pkey";

-- Rename foreign keys.
ALTER TABLE "Batch" RENAME CONSTRAINT "MealPlan_userId_fkey" TO "Batch_userId_fkey";
ALTER TABLE "BatchEntry" RENAME CONSTRAINT "PlanEntry_mealPlanId_fkey" TO "BatchEntry_batchId_fkey";
ALTER TABLE "BatchEntry" RENAME CONSTRAINT "PlanEntry_recipeId_fkey" TO "BatchEntry_recipeId_fkey";

-- Rename indexes.
ALTER INDEX "MealPlan_userId_idx" RENAME TO "Batch_userId_idx";
ALTER INDEX "PlanEntry_mealPlanId_idx" RENAME TO "BatchEntry_batchId_idx";

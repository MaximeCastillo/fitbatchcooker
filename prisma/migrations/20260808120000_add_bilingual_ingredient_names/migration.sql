-- Bilingual ingredient catalog — step 1/2.
--
-- `name` / `normalizedName` were implicitly FRENCH; make that explicit, and add the
-- English pair. HAND-WRITTEN: from a field rename Prisma generates DROP COLUMN + ADD
-- COLUMN, which would wipe every ingredient name and its unique index. Same reasoning as
-- 20260723164615_rename_meal_plan_to_batch.
ALTER TABLE "Ingredient" RENAME COLUMN "name" TO "nameFr";
ALTER TABLE "Ingredient" RENAME COLUMN "normalizedName" TO "normalizedNameFr";

-- RENAME COLUMN keeps the index itself (it is defined on the column, not its name); only
-- the index's NAME goes stale. Rename it to the convention Prisma expects
-- (<Table>_<column>_key) so schema and DB stay in agreement and the next migration does
-- not report drift.
ALTER INDEX "Ingredient_normalizedName_key" RENAME TO "Ingredient_normalizedNameFr_key";

-- English pair: NULLABLE for now. These values are NOT derivable from the French ones —
-- they can only come from the seed (step 2 = `npx prisma db seed`). The next migration
-- tightens them to NOT NULL + UNIQUE once every row is filled.
ALTER TABLE "Ingredient"
  ADD COLUMN "nameEn" TEXT,
  ADD COLUMN "normalizedNameEn" TEXT;

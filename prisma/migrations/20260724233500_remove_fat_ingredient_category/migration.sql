-- Remove the FAT value from IngredientCategory. Postgres can't drop an enum value in
-- place, so we recreate the type without it (all FAT rows were already reclassified to
-- CONDIMENT / VEGETABLE by the seed before this migration).
BEGIN;
CREATE TYPE "IngredientCategory_new" AS ENUM ('MEAT', 'FISH', 'VEGETABLE', 'DAIRY_EGG', 'STARCH', 'FRUIT', 'NUTS_SEEDS', 'LEGUME', 'CONDIMENT', 'OTHER');
ALTER TABLE "Ingredient" ALTER COLUMN "category" TYPE "IngredientCategory_new" USING ("category"::text::"IngredientCategory_new");
ALTER TYPE "IngredientCategory" RENAME TO "IngredientCategory_old";
ALTER TYPE "IngredientCategory_new" RENAME TO "IngredientCategory";
DROP TYPE "IngredientCategory_old";
COMMIT;

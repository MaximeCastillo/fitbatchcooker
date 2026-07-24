-- Drop the unused `servings` columns. A recipe is one part; placing it multiple times in
-- a batch day (multiple BatchEntry rows, shown as ×N) expresses "cook more".
ALTER TABLE "Recipe" DROP COLUMN "servings";
ALTER TABLE "BatchEntry" DROP COLUMN "servings";

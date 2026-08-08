-- Bilingual ingredient catalog — step 2/2.
--
-- The seed has filled every English name, so lock the invariant in. Guarded and
-- transactional (same BEGIN/COMMIT style as 20260724233500_remove_fat_ingredient_category):
-- a bare SET NOT NULL on a half-seeded table fails with a cryptic constraint error — this
-- one says what to do instead.
BEGIN;

DO $$
DECLARE missing integer;
BEGIN
  SELECT count(*) INTO missing
  FROM "Ingredient"
  WHERE "nameEn" IS NULL OR "normalizedNameEn" IS NULL;
  IF missing > 0 THEN
    RAISE EXCEPTION
      '% ingredient row(s) still have no English name — run `npx prisma db seed` before this migration.', missing;
  END IF;
END $$;

ALTER TABLE "Ingredient"
  ALTER COLUMN "nameEn" SET NOT NULL,
  ALTER COLUMN "normalizedNameEn" SET NOT NULL;

CREATE UNIQUE INDEX "Ingredient_normalizedNameEn_key" ON "Ingredient"("normalizedNameEn");

COMMIT;

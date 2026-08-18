-- Admin flag on User — gates the /admin account-management page.
--
-- No in-app way to grant it (out of scope, on purpose): promote someone with
--   UPDATE "User" SET "isAdmin" = true WHERE email = '…';
-- Default false, so every existing row stays a plain user.
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

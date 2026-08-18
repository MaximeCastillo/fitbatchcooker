// Deletes throwaway E2E accounts (see lib/test-accounts.ts) from BOTH sides: Supabase Auth
// first, then our tables. Run via tsx from the Playwright global teardown.
//
// The Auth pass enumerates auth.users rather than deriving ids from Prisma — that's the
// only way to reach the orphans left by every run before this script had the service-role
// key. Without SUPABASE_SERVICE_ROLE_KEY it warns and skips: a failed cleanup must not fail
// the suite.
//
// The Prisma client is loaded through createRequire (runtime require) so tsx/esbuild
// doesn't transform the large generated ESM client; hence relative imports below, no `@/`.
import "dotenv/config";
import { createRequire } from "node:module";
import { isTestAccountEmail, TEST_EMAIL_DOMAIN, TEST_EMAIL_PREFIX } from "../lib/test-accounts";
import { deleteAuthUsers, listAuthUsers } from "../lib/supabase/admin";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../lib/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

async function purgeAuthUsers(): Promise<number> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[e2e] SUPABASE_SERVICE_ROLE_KEY missing — auth.users left untouched");
    return 0;
  }

  const testUsers = (await listAuthUsers()).filter((user) =>
    isTestAccountEmail(user.email),
  );
  const deleted = await deleteAuthUsers(testUsers.map((user) => user.id));
  return deleted.length;
}

async function purgeAppRows(): Promise<number> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const users = await prisma.user.findMany({
    where: { email: { startsWith: TEST_EMAIL_PREFIX, endsWith: TEST_EMAIL_DOMAIN } },
    select: { id: true },
  });
  const ids = users.map((u: { id: string }) => u.id);
  if (ids.length > 0) {
    await prisma.batchEntry.deleteMany({ where: { batch: { userId: { in: ids } } } });
    await prisma.batch.deleteMany({ where: { userId: { in: ids } } });
    await prisma.userRecipe.deleteMany({ where: { userId: { in: ids } } });
    await prisma.recipe.deleteMany({ where: { userId: { in: ids } } });
    await prisma.preference.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }
  await prisma.$disconnect();
  return ids.length;
}

async function main() {
  const authCount = await purgeAuthUsers();
  const appCount = await purgeAppRows();
  console.log(`[e2e] purged ${appCount} app rows, ${authCount} auth users`);
}

main().catch((error) => {
  console.error("[e2e] purge failed:", error);
  process.exit(1);
});

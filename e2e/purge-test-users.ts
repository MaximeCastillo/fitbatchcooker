// Deletes throwaway E2E accounts (email prefix `e2e+`) and everything they own. Run via
// tsx from the Playwright global teardown. The Prisma client is loaded through
// createRequire (runtime require) so tsx/esbuild doesn't transform the large generated ESM
// client; the logic is wrapped in an async IIFE (no top-level await → esbuild stays happy
// with the CJS the createRequire pattern implies). The Supabase auth.users rows remain (no
// service-role key) — harmless, invisible in-app.
import "dotenv/config";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../lib/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const users = await prisma.user.findMany({
    where: { email: { startsWith: "e2e+" } },
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
  console.log(`[e2e] purged ${ids.length} test users`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("[e2e] purge failed:", error);
  process.exit(1);
});

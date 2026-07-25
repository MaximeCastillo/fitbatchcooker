// Prisma CLI configuration (Prisma 7).
// The `datasource.url` here is used by the Prisma CLI (migrations, db push, studio).
// It MUST point at a DIRECT / session connection (port 5432), never the pooled one.
// The app runtime connects separately through the pooled URL via a driver adapter
// (see lib/prisma.ts). See PROJECT_SPEC.md §9.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Command run by `npx prisma db seed` (Prisma 7 moved this out of package.json).
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});

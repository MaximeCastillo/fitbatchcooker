// Shared Prisma client for the app runtime.
// Uses the @prisma/adapter-pg driver adapter over the POOLED connection
// (DATABASE_URL). Prisma 7 ships without the Rust engine, so an adapter is
// required. See PROJECT_SPEC.md §9.
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// In dev, Next.js hot-reload re-imports this module on every change. Without the
// global cache we'd spawn a new PrismaClient (and connection pool) each time and
// exhaust the database connections. Cache one instance on globalThis in dev.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

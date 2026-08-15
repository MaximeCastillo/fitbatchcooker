import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toAdminAccount, type AdminAccount } from "@/lib/admin";

// Server-side gate for the whole /admin area. A non-admin (or a logged-out visitor) gets
// a plain 404, not a redirect or a "forbidden" page: the page's existence isn't something
// we need to advertise, and there's no link to it in the nav either.
//
// Not a Server Action file (no "use server") on purpose — these functions are called from
// server code only and must never become callable endpoints.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();
  return user;
}

export async function listAccounts(): Promise<AdminAccount[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      createdAt: true,
      weightKg: true,
      proteinTargetG: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map(toAdminAccount);
}

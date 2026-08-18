"use server";

import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { deletableAccountIds } from "@/lib/admin";
import { deleteAuthUsers } from "@/lib/supabase/admin";
import { redirect } from "@/i18n/navigation";
import { listAccounts, requireAdmin } from "./accounts";

// Deletes the selected accounts, for good. The form only carries ids: who is allowed to
// run this (admin) and which of those ids may actually go (not the caller's own, and only
// ids that match a real account) are both re-decided here — the client's checkboxes are a
// convenience, never the authority.
//
// Order matters: Supabase Auth first, our tables second. If auth deletion fails we stop
// and the account survives whole; the reverse order could leave someone able to log into
// an app with no data. Our tables cascade from User (schema.prisma), so one deleteMany
// takes the recipes, batches and preferences with it.
export async function deleteAccounts(formData: FormData) {
  const locale = await getLocale();
  const admin = await requireAdmin();

  const requestedIds = formData.getAll("accountIds").map(String);
  const accounts = await listAccounts();
  const idsToDelete = deletableAccountIds(accounts, requestedIds, admin.id);

  if (idsToDelete.length === 0) {
    redirect({ href: "/admin", locale });
  }

  let deletedIds: string[] = [];
  try {
    deletedIds = await deleteAuthUsers(idsToDelete);
  } catch (error) {
    // Missing service-role key, or Supabase unreachable: nothing was touched.
    console.error("[admin] account deletion aborted:", error);
    redirect({ href: { pathname: "/admin", query: { error: "1" } }, locale });
  }

  if (deletedIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: deletedIds } } });
  }

  const failedCount = idsToDelete.length - deletedIds.length;
  redirect({
    href: {
      pathname: "/admin",
      query: {
        deleted: String(deletedIds.length),
        ...(failedCount > 0 ? { failed: String(failedCount) } : {}),
      },
    },
    locale,
  });
}

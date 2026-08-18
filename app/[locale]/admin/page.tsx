import { getLocale, getTranslations } from "next-intl/server";
import { AdminAccounts, type AdminAccountRow } from "@/components/admin-accounts";
import { listAccounts, requireAdmin } from "./accounts";

export const dynamic = "force-dynamic";

// Admin-only account management. The gate is requireAdmin() — server-side, like every
// other authorization in this app (spec §7). Nothing links here: you reach /admin by
// typing it, and anyone without the flag gets a 404.
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; failed?: string; error?: string }>;
}) {
  const admin = await requireAdmin();
  const [{ deleted, failed, error }, accounts, locale, t] = await Promise.all([
    searchParams,
    listAccounts(),
    getLocale(),
    getTranslations("admin"),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const rows: AdminAccountRow[] = accounts.map((account) => ({
    id: account.id,
    email: account.email,
    createdAtLabel: dateFormatter.format(account.createdAt),
    isOnboarded: account.isOnboarded,
    isSelf: account.id === admin.id,
  }));

  const deletedCount = Number(deleted ?? 0);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("accountCount", { count: accounts.length })}
        </p>
      </div>

      {/* Outcome of the previous deletion, carried in the URL like the account page's
          ?saved=1 — the list itself is re-rendered fresh, so nothing else to sync. */}
      {deletedCount > 0 && (
        <p role="status" className="rounded-lg bg-muted px-4 py-3 text-sm">
          {t("deletedNotice", { count: deletedCount })}
        </p>
      )}
      {failed && (
        <p role="status" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t("failedNotice", { count: Number(failed) })}
        </p>
      )}
      {error && (
        <p role="status" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t("configError")}
        </p>
      )}

      <AdminAccounts accounts={rows} />
    </main>
  );
}

import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { ResetPasswordForm } from "@/components/auth-forms";
import { Link } from "@/i18n/navigation";

// Reached via the reset-email link → the callback route established a recovery session,
// so getCurrentUser returns the user. No session means the link was invalid or expired:
// we show that state with a way to request a fresh link.
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const t = await getTranslations("resetPassword");
  const user = await getCurrentUser();

  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border bg-card p-8 shadow-xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {user ? t("subtitle") : t("invalidLink")}
          </p>
        </div>

        {user ? (
          <ResetPasswordForm />
        ) : (
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t("requestNew")}
          </Link>
        )}
      </div>
    </main>
  );
}

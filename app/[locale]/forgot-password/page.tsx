import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/auth-forms";
import { Link } from "@/i18n/navigation";

// Public page: request a password-reset email. No auth guard — a logged-out user is
// exactly who needs it.
export default async function ForgotPasswordPage() {
  const t = await getTranslations("forgotPassword");

  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border bg-card p-8 shadow-xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <ForgotPasswordForm />

        <Link
          href="/login"
          className="text-sm font-semibold text-primary hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </main>
  );
}

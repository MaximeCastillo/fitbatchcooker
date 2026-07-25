import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/[locale]/login/actions";
import { EmailForm, PasswordForm } from "@/components/account-forms";
import { ProfileForm } from "@/components/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

// "Mon compte" — the account hub at /account. user.email is the authoritative
// Supabase-Auth address: getCurrentUser realigns our column to it on every load
// (self-heal).
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale: await getLocale() });
  const { saved } = await searchParams;
  const t = await getTranslations();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t("account.title")}</h1>

      {/* Which account am I on? The reason this page exists — shown first, prominently. */}
      <div className="rounded-xl bg-muted/60 px-4 py-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("account.connectedAs")}
        </p>
        <p className="mt-0.5 truncate text-lg font-semibold">{user.email}</p>
      </div>

      {/* Profile — unchanged behaviour: server action + ?saved=1 success flag. */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account.profileSection")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            user={{
              firstName: user.firstName,
              weightKg: user.weightKg,
              proteinTargetG: user.proteinTargetG,
            }}
            saved={!!saved}
          />
        </CardContent>
      </Card>

      {/* Change email */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account.emailSection")}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailForm currentEmail={user.email} />
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account.passwordSection")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      {/* Logout — infrequent action, kept visually secondary at the bottom. */}
      <form action={logout} className="mt-2">
        <Button type="submit" variant="outline" className="w-full">
          {t("nav.logout")}
        </Button>
      </form>
    </main>
  );
}

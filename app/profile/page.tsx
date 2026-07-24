import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "./actions";
import { EmailForm, PasswordForm } from "@/components/account-forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export const dynamic = "force-dynamic";

const inputClasses =
  "rounded-lg border border-input bg-background px-3 py-2.5 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40";

// "Mon compte" — the account hub. Kept on /profile so existing links and the login
// redirect keep working. user.email is the authoritative Supabase-Auth address:
// getCurrentUser realigns our column to it on every load (self-heal).
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { saved } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        {strings.account.title}
      </h1>

      {/* Which account am I on? The reason this page exists — shown first, prominently. */}
      <div className="rounded-xl bg-muted/60 px-4 py-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {strings.account.connectedAs}
        </p>
        <p className="mt-0.5 truncate text-lg font-semibold">{user.email}</p>
      </div>

      {/* Profile — unchanged behaviour: server action + ?saved=1 success flag. */}
      <Card>
        <CardHeader>
          <CardTitle>{strings.account.profileSection}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              {strings.profile.firstName}
              <input
                type="text"
                name="firstName"
                defaultValue={user.firstName ?? ""}
                autoComplete="given-name"
                className={inputClasses}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              {strings.profile.proteinTarget}
              <input
                type="number"
                name="proteinTargetG"
                min={0}
                defaultValue={user.proteinTargetG ?? ""}
                className={inputClasses}
              />
              <span className="text-xs font-normal text-muted-foreground">
                {strings.profile.proteinHint}
              </span>
            </label>

            {saved && (
              <p role="status" className="text-sm text-primary">
                {strings.profile.saved}
              </p>
            )}

            <Button type="submit" className="mt-1 h-11 w-full text-base">
              {strings.profile.save}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change email */}
      <Card>
        <CardHeader>
          <CardTitle>{strings.account.emailSection}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailForm currentEmail={user.email} />
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>{strings.account.passwordSection}</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}

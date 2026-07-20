import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export const dynamic = "force-dynamic";

// Protected profile screen. Reusable building block for a future onboarding flow.
export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { saved } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        {strings.profile.title}
      </h1>

      <form action={updateProfile} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {strings.profile.firstName}
          <input
            type="text"
            name="firstName"
            defaultValue={user.firstName ?? ""}
            autoComplete="given-name"
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {strings.profile.proteinTarget}
          <input
            type="number"
            name="proteinTargetG"
            min={0}
            defaultValue={user.proteinTargetG ?? ""}
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
          <span className="text-xs font-normal text-muted-foreground">
            {strings.profile.proteinHint}
          </span>
        </label>

        {saved && <p className="text-sm text-primary">{strings.profile.saved}</p>}

        <Button type="submit">{strings.profile.save}</Button>
      </form>
    </main>
  );
}

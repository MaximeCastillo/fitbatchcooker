import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { WelcomeForm } from "@/components/welcome-form";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

// Where a brand-new signup lands (see login/actions.ts). It exists for one reason: without
// a weight there is no protein target, so every gauge stays at 0 and the user can never see
// a day sealed green — the whole point of the product. Deliberately NOT a gate: the app is
// reachable without it, and the empty batch list nudges whoever skips.
export default async function WelcomePage() {
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale: await getLocale() });

  const t = await getTranslations("welcome");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
      <h1 className="font-display text-3xl font-bold tracking-wide uppercase">
        {t("title")}
      </h1>
      <p className="mt-1 mb-8 text-muted-foreground">{t("subtitle")}</p>

      <WelcomeForm
        user={{
          firstName: user.firstName,
          weightKg: user.weightKg,
          proteinTargetG: user.proteinTargetG,
        }}
      />
    </main>
  );
}

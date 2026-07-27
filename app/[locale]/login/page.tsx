import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/brand-icon";
import { APP_NAME } from "@/lib/constants";
import { Link } from "@/i18n/navigation";

// One auth screen, one mode at a time (driven by ?mode=signup) → a single primary
// action, no ambiguous double button. Stays a Server Component: no client JS needed.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;
  const isSignup = mode === "signup";
  const t = await getTranslations("login");
  const benefits = t.raw("benefits") as string[];

  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border bg-card shadow-xl md:grid-cols-2">
        {/* Value panel */}
        <aside className="relative hidden flex-col justify-between gap-8 bg-primary p-8 text-primary-foreground md:flex">
          <div className="flex items-center gap-2">
            {/* On the green panel the mark must read white-ish, so drive it with the
                foreground token (currentColor), not the primary green. */}
            <BrandIcon className="size-9 shrink-0 text-primary-foreground" />
            <span className="font-display text-lg font-bold tracking-wide uppercase">
              {APP_NAME}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-display text-3xl leading-none font-bold uppercase text-balance">
              {t("panelTitle")}
            </h2>
            <p className="text-primary-foreground/85">{t("panelSubtitle")}</p>
            <ul className="mt-2 flex flex-col gap-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-sm">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary-foreground/20">
                    <Check className="size-3" aria-hidden />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Form — single mode */}
        <div className="flex flex-col justify-center gap-6 p-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {isSignup ? t("titleSignup") : t("title")}
          </h1>

          <form className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              {t("email")}
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              {t("password")}
              <input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              formAction={isSignup ? signup : login}
              className="mt-1"
            >
              {isSignup ? t("signUp") : t("signIn")}
            </Button>
          </form>

          {/* Password recovery — only relevant when signing in. */}
          {!isSignup && (
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {t("forgotPasswordLink")}
            </Link>
          )}

          {/* Switch mode */}
          <p className="text-sm text-muted-foreground">
            {isSignup ? t("haveAccount") : t("noAccount")}{" "}
            <Link
              href={isSignup ? "/login" : "/login?mode=signup"}
              className="font-semibold text-primary hover:underline"
            >
              {isSignup ? t("signIn") : t("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

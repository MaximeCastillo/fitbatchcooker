import { Check } from "lucide-react";
import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

// Server Component with a plain <form>: the buttons point at Server Actions via
// formAction, so auth works with no client-side JavaScript.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border bg-card shadow-xl md:grid-cols-2">
        {/* Value panel — green ground, the "fill vessel" motif */}
        <aside className="relative hidden flex-col justify-between gap-8 bg-primary p-8 text-primary-foreground md:flex">
          <div className="flex items-center gap-2">
            <span className="relative grid size-9 shrink-0 overflow-hidden rounded-xl border-2 border-primary-foreground/70 bg-primary-foreground/10">
              <span className="absolute inset-x-0 bottom-0 h-[58%] bg-primary-foreground/80" />
            </span>
            <span className="font-display text-lg font-bold tracking-wide uppercase">
              FitBatchCooker
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-display text-3xl leading-none font-bold uppercase text-balance">
              {strings.login.panelTitle}
            </h2>
            <p className="text-primary-foreground/85">
              {strings.login.panelSubtitle}
            </p>
            <ul className="mt-2 flex flex-col gap-2.5">
              {strings.login.benefits.map((benefit) => (
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

        {/* Form */}
        <div className="flex flex-col justify-center gap-6 p-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {strings.login.title}
          </h1>

          <form className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              {strings.login.email}
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              {strings.login.password}
              <input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete="current-password"
                className="rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="mt-1 flex flex-col gap-2.5">
              <Button type="submit" formAction={login}>
                {strings.login.signIn}
              </Button>
              <Button type="submit" formAction={signup} variant="outline">
                {strings.login.signUp}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

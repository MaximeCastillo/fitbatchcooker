import { getLocale, getTranslations } from "next-intl/server";
import { CalendarPlus, Gauge, CookingPot } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { ProteinGauge } from "@/components/protein-gauge";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";

const stepIcons = [CalendarPlus, Gauge, CookingPot];

// Home page. Logged-in users go straight to their space; visitors get the pitch.
export default async function Home() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (user) redirect({ href: "/batch", locale });

  const t = await getTranslations("home");
  const steps = t.raw("steps") as { title: string; text: string }[];

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero — split: pitch left, gauges right */}
      <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-6 py-14 md:grid-cols-2">
        <div className="flex flex-col items-start gap-5">
          <h1 className="text-4xl leading-[0.95] font-bold tracking-tight text-balance uppercase sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/login?mode=signup" size="lg">
              {t("ctaPrimary")}
            </ButtonLink>
            <ButtonLink href="/recipes" size="lg" variant="outline">
              {t("ctaSecondary")}
            </ButtonLink>
          </div>
        </div>

        {/* Visual — a mini week of gauges filling to green */}
        <div className="rounded-3xl border bg-card p-8 shadow-xl">
          <div className="flex items-end justify-center gap-4">
            <ProteinGauge fill={100} sealed className="h-28 w-20" />
            <ProteinGauge fill={100} sealed className="h-28 w-20" />
            <ProteinGauge fill={72} className="h-28 w-20" />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("heroCaption")}
          </p>
        </div>
      </section>

      {/* How it works — a real 3-step sequence */}
      <section className="border-t bg-secondary/40">
        <div className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-12 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <div key={step.title} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-mono text-sm text-accent-warm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="text-lg font-bold tracking-tight uppercase">
                  {step.title}
                </h2>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

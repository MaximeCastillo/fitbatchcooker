import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, CalendarPlus, Gauge, CookingPot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { strings } from "@/lib/strings";

const stepIcons = [CalendarPlus, Gauge, CookingPot];

// A single "fill vessel" (the signature motif) — a container filled to `fill`% ,
// sealed with a check when full. Pure presentational.
function Vessel({ fill, sealed = false }: { fill: number; sealed?: boolean }) {
  return (
    <div className="relative flex flex-col items-center gap-2">
      <div
        className={`relative h-28 w-20 overflow-hidden rounded-xl border-2 bg-secondary ${
          sealed ? "border-primary" : "border-foreground/70"
        }`}
      >
        <div
          className="absolute inset-x-0 bottom-0 bg-primary"
          style={{ height: `${fill}%` }}
          aria-hidden
        />
        {sealed && (
          <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow">
            <Check className="size-3.5" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}

// Home page. Logged-in users go straight to their space; visitors get the pitch.
export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/recipes");

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero — split: pitch left, vessels right */}
      <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-6 py-14 md:grid-cols-2">
        <div className="flex flex-col items-start gap-5">
          <h1 className="text-4xl leading-[0.95] font-bold tracking-tight text-balance uppercase sm:text-5xl">
            {strings.home.title}
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            {strings.home.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              render={<Link href="/login?mode=signup" />}
              size="lg"
              nativeButton={false}
            >
              {strings.home.ctaPrimary}
            </Button>
            <Button
              render={<Link href="/recipes" />}
              size="lg"
              variant="outline"
              nativeButton={false}
            >
              {strings.home.ctaSecondary}
            </Button>
          </div>
        </div>

        {/* Visual — a mini week of vessels filling to green */}
        <div className="rounded-3xl border bg-card p-8 shadow-xl">
          <div className="flex items-end justify-center gap-4">
            <Vessel fill={100} sealed />
            <Vessel fill={100} sealed />
            <Vessel fill={72} />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Deux jours au vert, un en cours.
          </p>
        </div>
      </section>

      {/* How it works — a real 3-step sequence */}
      <section className="border-t bg-secondary/40">
        <div className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-12 sm:grid-cols-3">
          {strings.home.steps.map((step, index) => {
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

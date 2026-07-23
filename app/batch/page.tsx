import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createBatch } from "./actions";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export const dynamic = "force-dynamic";

// "Mes batchs" — the library of saved batches. Scoped to the current user (spec §7).
export default async function BatchListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const plans = await prisma.mealPlan.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { entries: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {strings.batch.title}
          </h1>
          <p className="mt-1 text-muted-foreground">{strings.batch.subtitle}</p>
        </div>
        <form action={createBatch}>
          <Button type="submit">
            <Plus className="size-4" aria-hidden />
            {strings.batch.new}
          </Button>
        </form>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed p-10">
          <p className="text-muted-foreground">{strings.batch.empty}</p>
          <form action={createBatch}>
            <Button type="submit">
              <Plus className="size-4" aria-hidden />
              {strings.batch.new}
            </Button>
          </form>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <li key={plan.id}>
              <Link
                href={`/batch/${plan.id}`}
                className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-primary"
              >
                <span className="font-display text-xl font-bold tracking-wide uppercase">
                  {plan.name ?? strings.batch.untitled}
                </span>
                <span className="mt-auto flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" aria-hidden />
                    {strings.batch.days(plan.dayCount)}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{strings.batch.dishes(plan._count.entries)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

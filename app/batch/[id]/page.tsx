import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft, Trash2, Check, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  dayProteinG,
  dayProgressPct,
  isDayComplete,
  dailyProteinTargetG,
  batchQuota,
} from "@/lib/nutrition";
import {
  renameBatch,
  deleteBatch,
  addEntry,
  removeEntry,
  addDay,
  removeDay,
} from "../actions";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export const dynamic = "force-dynamic";

// The batch composer: days rendered from the DB, add/remove dishes by click (the
// drag layer lands in the next phase). Scoped to the owner (spec §7).
export default async function BatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [plan, recipes] = await Promise.all([
    prisma.batch.findFirst({
      where: { id, userId: user.id },
      include: {
        entries: { include: { recipe: true }, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.recipe.findMany({ orderBy: { title: "asc" } }),
  ]);
  if (!plan) notFound();

  const targetG = dailyProteinTargetG(user);

  // Group entries per day.
  const byDay: (typeof plan.entries)[] = Array.from(
    { length: plan.dayCount },
    () => [],
  );
  for (const entry of plan.entries) {
    if (entry.dayIndex >= 0 && entry.dayIndex < plan.dayCount) {
      byDay[entry.dayIndex].push(entry);
    }
  }

  const greenDays = byDay.filter((entries) =>
    isDayComplete(
      dayProteinG(
        entries.map((e) => ({
          servings: e.servings,
          proteinPerServingG: e.recipe.proteinPerServingG,
        })),
      ),
      targetG,
    ),
  ).length;

  // Batch quota: portions to cook per recipe across the whole plan.
  const quota = batchQuota(
    plan.entries.map((e) => ({ recipeId: e.recipeId, servings: e.servings })),
  );

  // Inline Server Actions (plan id captured in the closure).
  async function rename(formData: FormData) {
    "use server";
    await renameBatch(id, String(formData.get("name") ?? ""));
  }
  async function addDish(formData: FormData) {
    "use server";
    await addEntry(
      id,
      Number(formData.get("dayIndex")),
      String(formData.get("recipeId") ?? ""),
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link
        href="/batch"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {strings.batch.title}
      </Link>

      <div className="mb-6 flex items-end justify-between gap-4">
        <form action={rename} className="flex items-center gap-2">
          <input
            name="name"
            defaultValue={plan.name ?? ""}
            aria-label={strings.batch.nameLabel}
            className="min-w-0 border-b-2 border-transparent bg-transparent font-display text-3xl font-bold tracking-wide uppercase outline-none hover:border-border focus:border-primary"
          />
          <Button type="submit" variant="outline" size="sm">
            {strings.batch.rename}
          </Button>
        </form>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary sm:inline">
            {strings.batch.greenDays(greenDays)}
          </span>
          <form action={deleteBatch.bind(null, plan.id)}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              aria-label={strings.batch.delete}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </form>
        </div>
      </div>

      {targetG === null && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          {strings.batch.noTarget}
          <Link href="/profile" className="font-semibold text-primary hover:underline">
            {strings.batch.setTarget}
          </Link>
        </p>
      )}

      {/* Days */}
      <div className="flex flex-col gap-3">
        {byDay.map((entries, dayIndex) => {
          const total = dayProteinG(
            entries.map((e) => ({
              servings: e.servings,
              proteinPerServingG: e.recipe.proteinPerServingG,
            })),
          );
          const pct = dayProgressPct(total, targetG);
          const done = isDayComplete(total, targetG);

          return (
            <div
              key={dayIndex}
              className={`flex flex-wrap gap-4 rounded-2xl border bg-card p-4 ${
                done ? "border-primary/55" : ""
              }`}
            >
              {/* Left: label + vessel gauge */}
              <div className="flex w-[150px] shrink-0 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold tracking-wide uppercase">
                    {strings.batch.dayLabel(dayIndex + 1)}
                  </span>
                  {entries.length === 0 && plan.dayCount > 1 && (
                    <form
                      action={removeDay.bind(null, plan.id, dayIndex)}
                      className="ml-auto"
                    >
                      <button
                        type="submit"
                        aria-label={strings.batch.removeDayLabel}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </form>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`relative h-13 w-9 shrink-0 overflow-hidden rounded-[8px] border-2 bg-secondary ${
                      done ? "border-primary" : "border-muted-foreground/50"
                    }`}
                  >
                    <div
                      className="absolute inset-x-0 bottom-0 bg-primary transition-[height]"
                      style={{ height: `${pct}%` }}
                      aria-hidden
                    />
                    {done && (
                      <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col leading-none">
                    <b className="font-display text-2xl">{total}</b>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      / {targetG ?? "—"} g
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: dishes + add form */}
              <div className="flex flex-1 flex-col gap-2">
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {strings.batch.emptyDay}
                  </p>
                ) : (
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
                    {entries.map((entry) => (
                      <li
                        key={entry.id}
                        className="relative flex flex-col justify-between gap-1 rounded-xl border bg-secondary p-2 pr-6"
                      >
                        <span className="line-clamp-2 text-sm font-semibold leading-tight">
                          {entry.recipe.title}
                        </span>
                        <span className="font-mono text-xs font-bold text-accent-warm">
                          {entry.recipe.proteinPerServingG ?? "—"} g
                        </span>
                        <form
                          action={removeEntry.bind(null, entry.id)}
                          className="absolute top-0.5 right-0.5"
                        >
                          <button
                            type="submit"
                            aria-label={strings.batch.removeDish}
                            className="text-muted-foreground hover:text-accent-warm"
                          >
                            ×
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                <form action={addDish} className="mt-1 flex items-center gap-2">
                  <input type="hidden" name="dayIndex" value={dayIndex} />
                  <select
                    name="recipeId"
                    required
                    defaultValue=""
                    aria-label={strings.batch.pickRecipe}
                    className="min-w-0 flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus-visible:border-ring"
                  >
                    <option value="" disabled>
                      {strings.batch.pickRecipe}
                    </option>
                    {recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.title}
                        {recipe.proteinPerServingG != null
                          ? ` — ${recipe.proteinPerServingG} g`
                          : ""}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" variant="outline">
                    <Plus className="size-4" aria-hidden />
                    {strings.batch.addDish}
                  </Button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      <form action={addDay.bind(null, plan.id)} className="mt-3">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="size-4" aria-hidden />
          {strings.batch.addDay}
        </button>
      </form>

      {/* Batch quota */}
      <section className="mt-8 rounded-2xl border bg-card p-5">
        <h2 className="font-display text-xl font-bold tracking-wide uppercase">
          {strings.batch.toCook}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {strings.batch.toCookHint}
        </p>
        {Object.keys(quota).length === 0 ? (
          <p className="text-sm text-muted-foreground">{strings.batch.emptyDay}</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {Object.entries(quota).map(([recipeId, portions]) => {
              const recipe = recipes.find((r) => r.id === recipeId);
              return (
                <li
                  key={recipeId}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {recipe?.title ?? "—"}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {strings.batch.perServing(recipe?.proteinPerServingG ?? null)}
                    </span>
                  </span>
                  <span className="font-display text-2xl text-accent-warm">
                    {strings.batch.times(portions)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

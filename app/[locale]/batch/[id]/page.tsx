import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { dailyProteinTargetG } from "@/lib/nutrition";
import { recipeVisibilityWhere } from "@/lib/recipes";
import { BatchBoard } from "@/components/batch-board";
import { BatchTitle } from "@/components/batch-title";
import { Link, redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

// The batch composer. Server fetches the data + owns the header (name, delete);
// the interactive board (drag & drop, gauges, quota) is a Client Component.
export default async function BatchPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale: await getLocale() });

  const t = await getTranslations("batch");

  const [plan, recipes] = await Promise.all([
    prisma.batch.findFirst({
      where: { id, userId: user.id },
      include: {
        entries: { include: { recipe: true }, orderBy: { createdAt: "asc" } },
      },
    }),
    // Palette = every recipe the user may see (shared library + their own), so it's never
    // empty at first use. A client-side Favorites toggle narrows it to saved recipes.
    prisma.recipe.findMany({
      where: recipeVisibilityWhere(user.id),
      orderBy: { title: "asc" },
      include: { savedBy: { where: { userId: user.id }, select: { id: true } } },
    }),
  ]);
  if (!plan) notFound();

  const targetG = dailyProteinTargetG(user);

  const initialEntries = plan.entries.map((e) => ({
    id: e.id,
    recipeId: e.recipeId,
    dayIndex: e.dayIndex,
    title: e.recipe.title,
    proteinPerServingG: e.recipe.proteinPerServingG,
  }));
  // Palette recipes carry enough to render the preview modal without a second fetch, plus
  // whether the user saved it (for the Favorites filter).
  const recipeList = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    proteinPerServingG: r.proteinPerServingG,
    summary: r.summary,
    caloriesPerServingKcal: r.caloriesPerServingKcal,
    steps: r.steps,
    saved: r.savedBy.length > 0,
  }));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link
        href="/batch"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t("title")}
      </Link>

      <div className="mb-6">
        <BatchTitle planId={plan.id} initialName={plan.name ?? ""} />
      </div>

      {targetG === null && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          {t("noTarget")}
          <Link
            href="/welcome"
            className="font-semibold text-primary hover:underline"
          >
            {t("setTarget")}
          </Link>
        </p>
      )}

      <BatchBoard
        planId={plan.id}
        initialEntries={initialEntries}
        initialDayCount={plan.dayCount}
        recipes={recipeList}
        targetG={targetG}
      />
    </main>
  );
}

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { dailyProteinTargetG } from "@/lib/nutrition";
import { deleteBatch } from "../actions";
import { BatchBoard } from "@/components/batch-board";
import { BatchTitle } from "@/components/batch-title";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export const dynamic = "force-dynamic";

// The batch composer. Server fetches the data + owns the header (name, delete);
// the interactive board (drag & drop, gauges, quota) is a Client Component.
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

  const initialEntries = plan.entries.map((e) => ({
    id: e.id,
    recipeId: e.recipeId,
    dayIndex: e.dayIndex,
    servings: e.servings,
    title: e.recipe.title,
    proteinPerServingG: e.recipe.proteinPerServingG,
  }));
  const recipeList = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    proteinPerServingG: r.proteinPerServingG,
  }));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link
        href="/batch"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {strings.batch.title}
      </Link>

      <div className="mb-6 flex items-center justify-between gap-4">
        <BatchTitle planId={plan.id} initialName={plan.name ?? ""} />
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

      {targetG === null && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          {strings.batch.noTarget}
          <Link
            href="/profile"
            className="font-semibold text-primary hover:underline"
          >
            {strings.batch.setTarget}
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

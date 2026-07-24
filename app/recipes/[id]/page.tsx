import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SaveToggle } from "@/components/save-toggle";
import { strings } from "@/lib/strings";

// Render on each request: recipe content and per-user saved state both vary.
export const dynamic = "force-dynamic";

// Recipe detail: cooking steps, protein per serving, portions. Reached by tapping a
// recipe card. Data access is server-side; the saved state is scoped to the logged-in
// user (spec §7). Anonymous visitors can read the recipe but see no save button.
export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [recipe, user] = await Promise.all([
    prisma.recipe.findUnique({ where: { id } }),
    getCurrentUser(),
  ]);

  if (!recipe) notFound();

  const isSaved = user
    ? (await prisma.userRecipe.findUnique({
        where: { userId_recipeId: { userId: user.id, recipeId: recipe.id } },
        select: { id: true },
      })) != null
    : false;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Link
        href="/recipes"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {strings.recipes.detail.back}
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
      {recipe.summary && (
        <p className="mt-2 text-muted-foreground">{recipe.summary}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {recipe.proteinPerServingG != null && (
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            {strings.recipes.protein(recipe.proteinPerServingG)}
          </span>
        )}
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
          {strings.recipes.servings(recipe.servings)}
        </span>
        {recipe.caloriesPerServingKcal != null && (
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
            {strings.recipes.calories(recipe.caloriesPerServingKcal)}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {strings.recipes.detail.approxNote}
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          {strings.recipes.detail.stepsTitle}
        </h2>
        {recipe.steps.length === 0 ? (
          <p className="text-muted-foreground">
            {strings.recipes.detail.stepsEmpty}
          </p>
        ) : (
          <ol className="flex flex-col gap-4">
            {recipe.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {user && (
        <div className="mt-8 max-w-xs">
          <SaveToggle recipeId={recipe.id} saved={isSaved} />
        </div>
      )}
    </main>
  );
}

import { prisma } from "@/lib/prisma";
import { RecipeCard } from "@/components/recipe-card";
import { SaveToggle } from "@/components/save-toggle";
import { getCurrentUser } from "@/lib/auth";
import { strings } from "@/lib/strings";

// Render on each request (not prerendered at build): the library grows over time and
// saved state is per-user. Opts out of Next's default static rendering.
export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const [recipes, user] = await Promise.all([
    prisma.recipe.findMany({ orderBy: { createdAt: "desc" } }),
    getCurrentUser(),
  ]);

  // Recipes the current user has saved — scoped to their own userId (spec §7).
  const savedRecipeIds = user
    ? new Set(
        (
          await prisma.userRecipe.findMany({
            where: { userId: user.id },
            select: { recipeId: true },
          })
        ).map((entry) => entry.recipeId),
      )
    : new Set<string>();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        {strings.recipes.title}
      </h1>

      {recipes.length === 0 ? (
        <p className="text-muted-foreground">{strings.recipes.empty}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {recipes.map((recipe) => {
            const isSaved = savedRecipeIds.has(recipe.id);
            return (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe}>
                  <SaveToggle recipeId={recipe.id} saved={isSaved} />
                </RecipeCard>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

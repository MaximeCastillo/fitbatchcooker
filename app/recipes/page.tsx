import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { toggleSaveRecipe } from "./actions";
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
                <Card className="flex h-full flex-col">
                  <CardHeader>
                    <CardTitle>{recipe.title}</CardTitle>
                    {recipe.summary && (
                      <CardDescription>{recipe.summary}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 text-sm">
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
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <form action={toggleSaveRecipe} className="w-full">
                      <input type="hidden" name="recipeId" value={recipe.id} />
                      <Button
                        type="submit"
                        variant={isSaved ? "secondary" : "outline"}
                        size="sm"
                        className="w-full"
                      >
                        {isSaved ? strings.recipes.saved : strings.recipes.save}
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

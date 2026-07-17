import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { strings } from "@/lib/strings";

// Render on each request instead of prerendering at build time. The recipe library
// grows over time (seed, then AI-created recipes), so we want fresh data — and the
// build no longer needs a DB connection. Opts out of Next's default static rendering.
export const dynamic = "force-dynamic";

// Server Component: it runs on the server and can await the database directly.
// Recipes are a shared library, so this query is intentionally NOT scoped to a user
// (unlike user-owned data such as saved recipes or preferences — see spec §7).
export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{strings.recipes.title}</h1>

      {recipes.length === 0 ? (
        <p className="text-muted-foreground">{strings.recipes.empty}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Card className="h-full">
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
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

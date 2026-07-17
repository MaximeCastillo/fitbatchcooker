import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// UI copy grouped in one place (i18n habit — spec §7ter: no scattered hardcoded text).
const copy = {
  title: "Recettes",
  empty: "Aucune recette pour l'instant.",
  protein: (grams: number) => `${grams} g de protéines / portion`,
  servings: (count: number) => `${count} portion${count > 1 ? "s" : ""}`,
  calories: (kcal: number) => `${kcal} kcal / portion`,
};

// Server Component: it runs on the server and can await the database directly.
// Recipes are a shared library, so this query is intentionally NOT scoped to a user
// (unlike user-owned data such as saved recipes or preferences — see spec §7).
export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{copy.title}</h1>

      {recipes.length === 0 ? (
        <p className="text-muted-foreground">{copy.empty}</p>
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
                      {copy.protein(recipe.proteinPerServingG)}
                    </span>
                  )}
                  <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                    {copy.servings(recipe.servings)}
                  </span>
                  {recipe.caloriesPerServingKcal != null && (
                    <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                      {copy.calories(recipe.caloriesPerServingKcal)}
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

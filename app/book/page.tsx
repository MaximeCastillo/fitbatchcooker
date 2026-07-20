import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/recipe-card";
import { toggleSaveRecipe } from "@/app/recipes/actions";
import { strings } from "@/lib/strings";

export const dynamic = "force-dynamic";

// The user's personal recipe book. Protected: only for logged-in users, and scoped
// to their own saved recipes (spec §7).
export default async function BookPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const saved = await prisma.userRecipe.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { recipe: true },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        {strings.book.title}
      </h1>

      {saved.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-muted-foreground">{strings.book.empty}</p>
          <Button render={<Link href="/recipes" />} nativeButton={false}>
            {strings.book.browse}
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {saved.map(({ recipe }) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe}>
                <form action={toggleSaveRecipe} className="w-full">
                  <input type="hidden" name="recipeId" value={recipe.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {strings.recipes.remove}
                  </Button>
                </form>
              </RecipeCard>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

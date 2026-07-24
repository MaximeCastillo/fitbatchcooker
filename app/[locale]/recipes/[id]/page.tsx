import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SaveToggle } from "@/components/save-toggle";
import { RecipeDetail } from "@/components/recipe-detail";
import { Link } from "@/i18n/navigation";

// Render on each request: recipe content and per-user saved state both vary.
export const dynamic = "force-dynamic";

// Recipe detail: cooking steps, protein per serving, portions. Reached by tapping a
// recipe card. Data access is server-side; the saved state is scoped to the logged-in
// user (spec §7). Anonymous visitors can read the recipe but see no save button.
export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("recipes");
  const [recipe, user] = await Promise.all([
    prisma.recipe.findUnique({ where: { id } }),
    getCurrentUser(),
  ]);

  // Visible only if it's a shared library recipe (userId null) or the user's own.
  if (!recipe || (recipe.userId && recipe.userId !== user?.id)) notFound();

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
        {t("detail.back")}
      </Link>

      <div className="mb-4 flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
        {user && <SaveToggle recipeId={recipe.id} saved={isSaved} />}
      </div>

      <RecipeDetail recipe={recipe} />
    </main>
  );
}

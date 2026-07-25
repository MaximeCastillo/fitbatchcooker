import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipe-detail";
import { RecipeModal } from "@/components/recipe-modal";
import { SaveToggle } from "@/components/save-toggle";
import { getRecipeDetailData } from "../../recipe-detail-data";

export const dynamic = "force-dynamic";

// Intercepting route: tapping a recipe card on /recipes opens this modal OVER the list
// (the list stays mounted → filters + scroll kept). Same data as the full page.
export default async function RecipeModalPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const data = await getRecipeDetailData(id);
  if (!data) notFound();

  return (
    <RecipeModal
      title={data.title}
      fullHref={`/recipes/${id}`}
      bookmark={
        data.canSave ? <SaveToggle recipeId={data.id} saved={data.isSaved} /> : null
      }
    >
      <RecipeDetail recipe={data.detail} />
    </RecipeModal>
  );
}

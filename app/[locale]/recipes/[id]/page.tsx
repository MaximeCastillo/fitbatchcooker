import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { SaveToggle } from "@/components/save-toggle";
import { RecipeDetail } from "@/components/recipe-detail";
import { Link } from "@/i18n/navigation";
import { getRecipeDetailData } from "../recipe-detail-data";

// Render on each request: recipe content and per-user saved state both vary.
export const dynamic = "force-dynamic";

// Recipe detail (full page): cooking steps, protein per serving, ingredients. Reached by
// a hard link / refresh / share; from the /recipes list a card opens the intercepting
// modal instead (see @modal/(.)[id]). Same data source, shared visibility scoping.
export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("recipes");
  const data = await getRecipeDetailData(id);
  if (!data) notFound();

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
        <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
        {data.canSave && <SaveToggle recipeId={data.id} saved={data.isSaved} />}
      </div>

      <RecipeDetail recipe={data.detail} />
    </main>
  );
}

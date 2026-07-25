import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { SaveToggle } from "@/components/save-toggle";
import { RecipeDetail } from "@/components/recipe-detail";
import { Link } from "@/i18n/navigation";
import { getRecipeDetailData } from "../recipe-detail-data";
import { sanitizeRecipeQuery } from "../filter-params";

// Render on each request: recipe content and per-user saved state both vary.
export const dynamic = "force-dynamic";

// Recipe detail (full page): cooking steps, protein per serving, ingredients. Reached from
// the browse preview modal's "full page" link, or directly (share / refresh).
// Visibility-scoped via the shared getRecipeDetailData helper.
//
// `?from=` carries the browse filters that were active, so the back link returns to the
// list exactly as it was. It's untrusted input — sanitizeRecipeQuery round-trips it through
// the filter whitelist before it lands in an href.
export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("recipes");
  const [data, { from }] = await Promise.all([
    getRecipeDetailData(id),
    searchParams,
  ]);
  if (!data) notFound();

  const backQuery = sanitizeRecipeQuery(from);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Link
        href={backQuery ? `/recipes?${backQuery}` : "/recipes"}
        className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
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

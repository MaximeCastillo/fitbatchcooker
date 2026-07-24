import { useTranslations } from "next-intl";

// The shared recipe "body": macro badges, the approximate-values note, and the
// numbered cooking steps. Single source of truth rendered by both the detail page
// (/recipes/[id]) and the preview modal in the batch composer. The heading chrome
// (page h1 + bookmark, or dialog title) is owned by each caller — not here.
//
// Uses `useTranslations` (not `getTranslations`) so it works in both a Server Component
// (the detail page) and a Client Component (the batch composer's preview modal).
type RecipeDetailData = {
  summary: string | null;
  servings: number;
  proteinPerServingG: number | null;
  caloriesPerServingKcal: number | null;
  steps: string[];
};

export function RecipeDetail({ recipe }: { recipe: RecipeDetailData }) {
  const t = useTranslations("recipes");
  return (
    <div>
      {recipe.summary && (
        <p className="text-muted-foreground">{recipe.summary}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {recipe.proteinPerServingG != null && (
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            {t("protein", { grams: recipe.proteinPerServingG })}
          </span>
        )}
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
          {t("servings", { count: recipe.servings })}
        </span>
        {recipe.caloriesPerServingKcal != null && (
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
            {t("calories", { kcal: recipe.caloriesPerServingKcal })}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("detail.approxNote")}
      </p>

      <section className="mt-6">
        <h3 className="mb-4 text-lg font-semibold tracking-tight">
          {t("detail.stepsTitle")}
        </h3>
        {recipe.steps.length === 0 ? (
          <p className="text-muted-foreground">{t("detail.stepsEmpty")}</p>
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
    </div>
  );
}

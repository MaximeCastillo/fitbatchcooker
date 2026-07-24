import { useTranslations } from "next-intl";
import type { IngredientCategory } from "@/lib/generated/prisma/enums";
import type { MealType } from "@/lib/generated/prisma/enums";
import { INGREDIENT_PICTO } from "@/lib/ingredients";

// The shared recipe "body": mealType + macro badges, ingredient list (picto + quantity),
// the approximate-values note, and the numbered steps. Single source of truth rendered by
// both the detail page (/recipes/[id]) and the batch composer's preview modal. `mealType`
// and `ingredients` are optional so the batch modal (which doesn't load them) still works.
//
// Uses `useTranslations` (not `getTranslations`) so it works in a Server Component (the
// detail page) and a Client Component (the preview modal) alike.
type RecipeDetailData = {
  summary: string | null;
  mealType?: MealType;
  proteinPerServingG: number | null;
  caloriesPerServingKcal: number | null;
  steps: string[];
  ingredients?: {
    name: string;
    category: IngredientCategory;
    quantityG: number;
  }[];
};

export function RecipeDetail({ recipe }: { recipe: RecipeDetailData }) {
  const t = useTranslations("recipes");
  return (
    <div>
      {recipe.summary && (
        <p className="text-muted-foreground">{recipe.summary}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {recipe.mealType && (
          <span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground">
            {t(`mealType.${recipe.mealType}`)}
          </span>
        )}
        {recipe.proteinPerServingG != null && (
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            {t("protein", { grams: recipe.proteinPerServingG })}
          </span>
        )}
        {recipe.caloriesPerServingKcal != null && (
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
            {t("calories", { kcal: recipe.caloriesPerServingKcal })}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("detail.approxNote")}
      </p>

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-lg font-semibold tracking-tight">
            {t("detail.ingredientsTitle")}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2.5 text-sm">
                <span className="text-lg leading-none" aria-hidden>
                  {INGREDIENT_PICTO[ingredient.category]}
                </span>
                <span className="flex-1">{ingredient.name}</span>
                <span className="font-mono text-muted-foreground">
                  {ingredient.quantityG} g
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

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

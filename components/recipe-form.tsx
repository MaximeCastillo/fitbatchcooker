"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import type { IngredientCategory, MealType } from "@/lib/generated/prisma/enums";
import { ingredientPicto } from "@/lib/ingredients";
import { createRecipe } from "@/app/[locale]/recipes/actions";
import { cn } from "@/lib/utils";

type CatalogItem = {
  id: string;
  name: string;
  category: IngredientCategory;
  picto: string | null;
};
type Row = { key: number; ingredientId: string; quantityG: string };
type Step = { key: number; text: string };

const MEAL_TYPES: MealType[] = ["MAIN", "SNACK", "BREAKFAST"];

const inputClass =
  "rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:border-ring";

export function RecipeForm({ catalog }: { catalog: CatalogItem[] }) {
  const t = useTranslations("recipes");
  const [pending, startTransition] = useTransition();
  const keyRef = useRef(2); // stable, monotonic id source for row/step React keys

  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState<MealType>("MAIN");
  const [steps, setSteps] = useState<Step[]>([{ key: 0, text: "" }]);
  const [rows, setRows] = useState<Row[]>([
    { key: 1, ingredientId: "", quantityG: "" },
  ]);

  const nextKey = () => keyRef.current++;

  const validRows = rows.filter((r) => r.ingredientId && Number(r.quantityG) > 0);
  const canSubmit =
    title.trim().length > 0 &&
    steps.some((s) => s.text.trim()) &&
    validRows.length > 0 &&
    !pending;

  function submit() {
    if (!canSubmit) return;
    startTransition(() => {
      createRecipe({
        title,
        mealType,
        steps: steps.map((s) => s.text),
        ingredients: validRows.map((r) => ({
          ingredientId: r.ingredientId,
          quantityG: Number(r.quantityG),
        })),
      });
    });
  }

  const iconBtn =
    "grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-destructive";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-6"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("form.title")}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("form.titlePlaceholder")}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-1.5 text-sm font-medium">
        {t("form.mealType")}
        <div className="flex gap-1.5">
          {MEAL_TYPES.map((mt) => (
            <button
              key={mt}
              type="button"
              onClick={() => setMealType(mt)}
              aria-pressed={mealType === mt}
              className={cn(
                "min-h-10 flex-1 rounded-lg border text-sm transition-colors",
                mealType === mt
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t(`mealType.${mt}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-sm font-medium">
        {t("form.steps")}
        {steps.map((step, i) => (
          <div key={step.key} className="flex gap-2">
            <textarea
              value={step.text}
              onChange={(e) =>
                setSteps((prev) =>
                  prev.map((s) =>
                    s.key === step.key ? { ...s, text: e.target.value } : s,
                  ),
                )
              }
              rows={2}
              placeholder={`${t("form.step")} ${i + 1}`}
              className={cn(inputClass, "flex-1 resize-y")}
            />
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSteps((prev) => prev.filter((s) => s.key !== step.key))
                }
                aria-label={t("remove")}
                className={iconBtn}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setSteps((prev) => [...prev, { key: nextKey(), text: "" }])
          }
          className="flex items-center gap-1 self-start text-sm font-normal text-primary"
        >
          <Plus className="size-4" aria-hidden />
          {t("form.addStep")}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 text-sm font-medium">
        {t("form.ingredients")}
        {rows.map((row) => (
          <div key={row.key} className="flex gap-2">
            <select
              value={row.ingredientId}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r) =>
                    r.key === row.key
                      ? { ...r, ingredientId: e.target.value }
                      : r,
                  ),
                )
              }
              className={cn(inputClass, "flex-1")}
            >
              <option value="">{t("form.pickIngredient")}</option>
              {catalog.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ingredientPicto(ing)} {ing.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={row.quantityG}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r) =>
                    r.key === row.key ? { ...r, quantityG: e.target.value } : r,
                  ),
                )
              }
              placeholder="g"
              className={cn(inputClass, "w-20")}
            />
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setRows((prev) => prev.filter((r) => r.key !== row.key))
                }
                aria-label={t("remove")}
                className={iconBtn}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setRows((prev) => [
              ...prev,
              { key: nextKey(), ingredientId: "", quantityG: "" },
            ])
          }
          className="flex items-center gap-1 self-start text-sm font-normal text-primary"
        >
          <Plus className="size-4" aria-hidden />
          {t("form.addIngredient")}
        </button>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {t("form.submit")}
      </button>
    </form>
  );
}

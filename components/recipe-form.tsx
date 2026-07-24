"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import type { IngredientCategory, MealType } from "@/lib/generated/prisma/enums";
import { INGREDIENT_PICTO } from "@/lib/ingredients";
import { createRecipe, createIngredient } from "@/app/[locale]/recipes/actions";
import { cn } from "@/lib/utils";

type CatalogItem = { id: string; name: string; category: IngredientCategory };
type Row = { key: number; ingredientId: string; quantityG: string };
type Step = { key: number; text: string };

const MEAL_TYPES: MealType[] = ["MAIN", "SNACK", "BREAKFAST"];
const CATEGORIES: IngredientCategory[] = [
  "MEAT",
  "FISH",
  "VEGETABLE",
  "DAIRY_EGG",
  "STARCH",
  "FRUIT",
  "NUTS_SEEDS",
  "LEGUME",
  "FAT",
  "OTHER",
];

const inputClass =
  "rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:border-ring";

export function RecipeForm({ catalog: initial }: { catalog: CatalogItem[] }) {
  const t = useTranslations("recipes");
  const tc = useTranslations("ingredients");
  const [pending, startTransition] = useTransition();
  const keyRef = useRef(2); // stable, monotonic id source for row/step React keys

  const [catalog, setCatalog] = useState(initial);
  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState<MealType>("MAIN");
  const [steps, setSteps] = useState<Step[]>([{ key: 0, text: "" }]);
  const [rows, setRows] = useState<Row[]>([
    { key: 1, ingredientId: "", quantityG: "" },
  ]);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<IngredientCategory>("OTHER");
  const [newProtein, setNewProtein] = useState("");

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

  function addNewIngredient() {
    const name = newName.trim();
    if (!name) return;
    startTransition(() => {
      createIngredient({
        name,
        category: newCategory,
        proteinPer100g: Number(newProtein) || 0,
      }).then((ing) => {
        setCatalog((prev) =>
          prev.some((i) => i.id === ing.id)
            ? prev
            : [...prev, ing].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setCreating(false);
        setNewName("");
        setNewProtein("");
        setNewCategory("OTHER");
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
                  {INGREDIENT_PICTO[ing.category]} {ing.name}
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
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() =>
              setRows((prev) => [
                ...prev,
                { key: nextKey(), ingredientId: "", quantityG: "" },
              ])
            }
            className="flex items-center gap-1 text-sm font-normal text-primary"
          >
            <Plus className="size-4" aria-hidden />
            {t("form.addIngredient")}
          </button>
          <button
            type="button"
            onClick={() => setCreating((c) => !c)}
            className="flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-4" aria-hidden />
            {t("form.newIngredient")}
          </button>
        </div>

        {creating && (
          <div className="mt-1 flex flex-wrap items-end gap-2 rounded-xl border bg-muted/40 p-3 font-normal">
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium">
              {t("form.name")}
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium">
              {t("form.category")}
              <select
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value as IngredientCategory)
                }
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {INGREDIENT_PICTO[c]} {tc(`categories.${c}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex w-24 flex-col gap-1 text-xs font-medium">
              {t("form.proteinPer100g")}
              <input
                type="number"
                min={0}
                max={100}
                value={newProtein}
                onChange={(e) => setNewProtein(e.target.value)}
                className={inputClass}
              />
            </label>
            <button
              type="button"
              onClick={addNewIngredient}
              disabled={!newName.trim() || pending}
              className="min-h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {t("form.add")}
            </button>
          </div>
        )}
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

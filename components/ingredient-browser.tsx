"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { IngredientCategory } from "@/lib/generated/prisma/enums";
import { INGREDIENT_PICTO } from "@/lib/ingredients";
import { cn } from "@/lib/utils";

type Ingredient = {
  id: string;
  name: string;
  category: IngredientCategory;
  proteinPer100g: number;
};

// Fixed category order for the filter chips (matches the picto map).
const CATEGORY_ORDER: IngredientCategory[] = [
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

// Client-side search + category filter over the (small) global catalog — no server
// round-trip needed at this size.
export function IngredientBrowser({ ingredients }: { ingredients: Ingredient[] }) {
  const t = useTranslations("ingredients");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IngredientCategory | null>(null);

  const search = query.trim().toLowerCase();
  const filtered = ingredients.filter(
    (ing) =>
      (!category || ing.category === category) &&
      (!search || ing.name.toLowerCase().includes(search)),
  );
  const presentCategories = CATEGORY_ORDER.filter((c) =>
    ingredients.some((ing) => ing.category === c),
  );

  const chipClass = (active: boolean) =>
    cn(
      "flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
      active
        ? "border-primary bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <div>
      <div className="relative mb-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          aria-label={t("search")}
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:border-ring"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategory(null)}
          aria-pressed={category === null}
          className={chipClass(category === null)}
        >
          {t("all")}
        </button>
        {presentCategories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(category === c ? null : c)}
            aria-pressed={category === c}
            className={chipClass(category === c)}
          >
            <span aria-hidden>{INGREDIENT_PICTO[c]}</span>
            {t(`categories.${c}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {filtered.map((ing) => (
            <li
              key={ing.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-3"
            >
              <span
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-lg"
                aria-hidden
              >
                {INGREDIENT_PICTO[ing.category]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium leading-tight">{ing.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t(`categories.${ing.category}`)}
                </div>
              </div>
              <span className="shrink-0 font-mono text-sm font-semibold text-accent-warm">
                {t("proteinPer100g", { grams: ing.proteinPer100g })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

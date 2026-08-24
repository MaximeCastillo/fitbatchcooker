"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { IngredientCategory } from "@/lib/generated/prisma/enums";
import {
  INGREDIENT_PICTO,
  ingredientName,
  ingredientPicto,
  normalizeName,
} from "@/lib/ingredients";
import { IngredientRecipesModal } from "@/components/ingredient-recipes-modal";
import { cn } from "@/lib/utils";

type Ingredient = {
  id: string;
  nameFr: string;
  nameEn: string;
  category: IngredientCategory;
  proteinPer100g: number;
  picto: string | null;
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
  "CONDIMENT",
  "OTHER",
];

// How many cards the list reveals at once. The catalog is fetched whole (it's small and
// public); what hurts is rendering 400+ cards, so we only paginate the DISPLAY.
const PAGE_SIZE = 40;

// Client-side search + category filter over the (small) global catalog — no server
// round-trip needed at this size. Tapping an ingredient opens a reverse-search modal
// (recipes that use it). `canSave` gates the bookmark toggle inside that modal.
export function IngredientBrowser({
  ingredients,
  canSave,
}: {
  ingredients: Ingredient[];
  canSave: boolean;
}) {
  const t = useTranslations("ingredients");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IngredientCategory | null>(null);
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Search ONLY the displayed language: matching the hidden one would surface rows whose
  // visible name doesn't contain what you typed, which reads as a bug. (The chef's
  // search_ingredients IS bilingual — it resolves names, it doesn't filter a list a human
  // is looking at.) normalizeName still applies, so "epinards" matches "Épinards".
  const search = normalizeName(query);
  const filtered = ingredients.filter(
    (ing) =>
      (!category || ing.category === category) &&
      (!search || normalizeName(ingredientName(ing, locale)).includes(search)),
  );
  const presentCategories = CATEGORY_ORDER.filter((c) =>
    ingredients.some((ing) => ing.category === c),
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll, display-only: reveal one more slice when the sentinel shows up. No
  // fetch, so no anti-double-load guard is needed — instead the effect re-runs on every
  // extension, which re-arms the observer and keeps revealing while the sentinel stays in
  // view (a filter that shrinks the list can't leave a gap below the fold).
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisibleCount((count) => count + PAGE_SIZE);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length]);

  // Every filter change restarts the window: keeping the offset of a narrow result set
  // would dump a wider one on screen all at once.
  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    setVisibleCount(PAGE_SIZE);
  }

  function changeCategory(nextCategory: IngredientCategory | null) {
    setCategory(nextCategory);
    setVisibleCount(PAGE_SIZE);
  }

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
          onChange={(e) => changeQuery(e.target.value)}
          placeholder={t("search")}
          aria-label={t("search")}
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:border-ring"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => changeCategory(null)}
          aria-pressed={category === null}
          className={chipClass(category === null)}
        >
          {t("all")}
        </button>
        {presentCategories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => changeCategory(category === c ? null : c)}
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
          {visible.map((ing) => (
            <li key={ing.id}>
              <button
                type="button"
                onClick={() => setSelected(ing)}
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary"
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-xl"
                  aria-hidden
                >
                  {ingredientPicto(ing)}
                </span>
                {/* Name breathes (no truncation) with the category below; the protein is a
                    compact badge so it can't crowd the name out on a narrow cell. */}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-tight">
                    {ingredientName(ing, locale)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t(`categories.${ing.category}`)}
                  </span>
                </span>
                <span
                  className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-accent-warm"
                  aria-label={t("proteinPer100g", { grams: ing.proteinPer100g })}
                >
                  {t("proteinPer100gShort", { grams: ing.proteinPer100g })}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasMore && <div ref={sentinelRef} className="h-10" aria-hidden />}

      <IngredientRecipesModal
        ingredient={selected}
        canSave={canSave}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { MealType } from "@/lib/generated/prisma/enums";
import {
  loadRecipes,
  type RecipeCardData,
  type RecipeFilters,
} from "@/app/[locale]/recipes/actions";
import { RecipeCard } from "@/components/recipe-card";
import { SaveToggle } from "@/components/save-toggle";
import { cn } from "@/lib/utils";

const MEAL_TABS: (MealType | null)[] = [null, "MAIN", "SNACK", "BREAKFAST"];

// Client browse: search + mealType tabs + optional "my recipes" toggle, over cursor-
// paginated results fed by the loadRecipes server action, with infinite scroll.
export function RecipeBrowser({
  initialRecipes,
  initialNextCursor,
  showMine,
}: {
  initialRecipes: RecipeCardData[];
  initialNextCursor: string | null;
  showMine: boolean;
}) {
  const t = useTranslations("recipes");
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [mine, setMine] = useState(false);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [cursor, setCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);

  const didMount = useRef(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filters: RecipeFilters = { search, mealType, mine };
  const filterKey = JSON.stringify(filters);

  // Refetch page 1 whenever a filter changes. Skip the first render (the server already
  // provided page 1) and debounce a touch so typing doesn't fire a query per keystroke.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    let active = true;
    const handle = setTimeout(() => {
      loadRecipes(JSON.parse(filterKey) as RecipeFilters, null).then((res) => {
        if (!active) return;
        setRecipes(res.recipes);
        setCursor(res.nextCursor);
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [filterKey]);

  // Infinite scroll: load the next page when the sentinel enters the viewport. The
  // loadingRef guard stops a fast scroll from firing two loads for the same cursor.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || cursor === null) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      loadRecipes(JSON.parse(filterKey) as RecipeFilters, cursor).then((res) => {
        setRecipes((prev) => [...prev, ...res.recipes]);
        setCursor(res.nextCursor);
        loadingRef.current = false;
        setLoading(false);
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, filterKey]);

  const chipClass = (active: boolean) =>
    cn(
      "flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors",
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("filters.search")}
          aria-label={t("filters.search")}
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:border-ring"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {MEAL_TABS.map((mt) => (
          <button
            key={mt ?? "all"}
            type="button"
            onClick={() => setMealType(mt)}
            aria-pressed={mealType === mt}
            className={chipClass(mealType === mt)}
          >
            {mt ? t(`mealType.${mt}`) : t("mealType.all")}
          </button>
        ))}
        {showMine && (
          <button
            type="button"
            onClick={() => setMine((m) => !m)}
            aria-pressed={mine}
            className={chipClass(mine)}
          >
            {t("filters.mine")}
          </button>
        )}
      </div>

      {recipes.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard
                recipe={{
                  title: recipe.title,
                  summary: recipe.summary,
                  servings: 1,
                  proteinPerServingG: recipe.proteinPerServingG,
                  caloriesPerServingKcal: recipe.caloriesPerServingKcal,
                }}
                href={`/recipes/${recipe.id}`}
                bookmark={
                  showMine ? (
                    <SaveToggle recipeId={recipe.id} saved={recipe.saved} />
                  ) : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      {cursor !== null ? (
        <div ref={sentinelRef} className="h-10" aria-hidden />
      ) : recipes.length > 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("end")}
        </p>
      ) : null}

      {loading && (
        <p className="mt-2 text-center text-sm text-muted-foreground" role="status">
          …
        </p>
      )}
    </div>
  );
}

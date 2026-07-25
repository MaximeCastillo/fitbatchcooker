"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Bookmark, Search } from "lucide-react";
import type { MealType } from "@/lib/generated/prisma/enums";
import { loadRecipes, type RecipeCardData } from "@/app/[locale]/recipes/actions";
import {
  MEAL_TYPES,
  parseRecipeQueryString,
  serializeRecipeFilters,
  type ParsedRecipeFilters,
} from "@/app/[locale]/recipes/filter-params";
import { RecipeCard } from "@/components/recipe-card";
import {
  RecipePreviewModal,
  type PreviewedRecipe,
} from "@/components/recipe-preview-modal";
import { SaveToggle } from "@/components/save-toggle";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Client browse: search + meal-type chips + a Favorites toggle over cursor-paginated
// results fed by the loadRecipes server action, with infinite scroll. The list is
// visibility-scoped server-side (public + own). `canSave` shows the bookmark toggle and
// the Favorites filter.
//
// Meal types are a MULTI-select (Snacks + Breakfast = both); "All" is the escape hatch
// that clears them. Filters are mirrored into the URL query so coming back from a recipe
// page restores them — initial values come from the server, which read the same params.
// Tapping a card opens a preview modal instead of navigating, so the list (filters,
// scroll) never gets torn down.
export function RecipeBrowser({
  initialRecipes,
  initialNextCursor,
  canSave,
  initialFilters,
}: {
  initialRecipes: RecipeCardData[];
  initialNextCursor: string | null;
  canSave: boolean;
  initialFilters: ParsedRecipeFilters;
}) {
  const t = useTranslations("recipes");
  const router = useRouter();
  const [search, setSearch] = useState(initialFilters.search);
  const [mealTypes, setMealTypes] = useState<MealType[]>(initialFilters.mealTypes);
  const [favoritesOnly, setFavoritesOnly] = useState(initialFilters.favoritesOnly);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [cursor, setCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);
  // `preview` outlives `previewOpen` so the modal keeps its content while animating out.
  const [preview, setPreview] = useState<PreviewedRecipe | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const didMount = useRef(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Canonical query string for the active filters — it doubles as the URL we push, the
  // effect dependency, and the `?from=` payload handed to the detail page.
  const filterQuery = serializeRecipeFilters({ search, mealTypes, favoritesOnly });

  // Refetch page 1 + mirror the filters into the URL whenever a filter changes. Skip the
  // first render (the server already provided page 1 for the initial URL) and debounce a
  // touch so typing doesn't fire a query per keystroke.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    let active = true;
    const handle = setTimeout(() => {
      // Replace (no scroll) rather than push: filter tweaks shouldn't pile up in history,
      // but the entry we leave behind carries the filters, so Back restores them.
      router.replace(filterQuery ? `/recipes?${filterQuery}` : "/recipes", {
        scroll: false,
      });

      loadRecipes(parseRecipeQueryString(filterQuery), null).then((res) => {
        if (!active) return;
        setRecipes(res.recipes);
        setCursor(res.nextCursor);
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [filterQuery, router]);

  // Infinite scroll: load the next page when the sentinel enters the viewport. The
  // loadingRef guard stops a fast scroll from firing two loads for the same cursor.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || cursor === null) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      loadRecipes(parseRecipeQueryString(filterQuery), cursor).then((res) => {
        setRecipes((prev) => [...prev, ...res.recipes]);
        setCursor(res.nextCursor);
        loadingRef.current = false;
        setLoading(false);
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, filterQuery]);

  // "All" clears the selection; any other chip toggles in/out of it.
  function toggleMealType(mealType: MealType) {
    setMealTypes((current) =>
      current.includes(mealType)
        ? current.filter((mt) => mt !== mealType)
        : [...current, mealType],
    );
  }

  function openPreview(recipe: RecipeCardData, source: HTMLElement) {
    // Fly the panel out of the tapped card (same motion as the batch composer).
    const rect = source.getBoundingClientRect();
    setPreview({
      id: recipe.id,
      title: recipe.title,
      saved: recipe.saved,
      origin: {
        dx: rect.left + rect.width / 2 - window.innerWidth / 2,
        dy: rect.top + rect.height / 2 - window.innerHeight / 2,
      },
    });
    setPreviewOpen(true);
  }

  // Bookmarking from inside the modal must also update the card behind it (the list
  // caches its rows in state, so revalidatePath alone never reaches them).
  function applySavedChange(recipeId: string, saved: boolean) {
    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, saved } : recipe,
      ),
    );
    setPreview((current) =>
      current && current.id === recipeId ? { ...current, saved } : current,
    );
  }

  // min-h-11 = 44px: these are now multi-select, so they get tapped a lot (PRINCIPLES §5).
  const chipClass = (active: boolean) =>
    cn(
      "flex min-h-11 items-center rounded-full border px-3.5 text-sm transition-colors",
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
        <button
          type="button"
          onClick={() => setMealTypes([])}
          aria-pressed={mealTypes.length === 0}
          className={chipClass(mealTypes.length === 0)}
        >
          {t("mealType.all")}
        </button>
        {MEAL_TYPES.map((mealType) => (
          <button
            key={mealType}
            type="button"
            onClick={() => toggleMealType(mealType)}
            aria-pressed={mealTypes.includes(mealType)}
            className={chipClass(mealTypes.includes(mealType))}
          >
            {t(`mealType.${mealType}`)}
          </button>
        ))}
        {canSave && (
          <button
            type="button"
            onClick={() => setFavoritesOnly((v) => !v)}
            aria-pressed={favoritesOnly}
            className={cn(chipClass(favoritesOnly), "ml-auto gap-1.5")}
          >
            <Bookmark
              className={cn("size-3.5", favoritesOnly && "fill-primary")}
              aria-hidden
            />
            {t("filters.favorites")}
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
                recipe={recipe}
                href={`/recipes/${recipe.id}`}
                onOpen={(source) =>
                  openPreview(recipe, source.closest("li") ?? source)
                }
                bookmark={
                  canSave ? (
                    <SaveToggle
                      recipeId={recipe.id}
                      saved={recipe.saved}
                      onToggle={(saved) => applySavedChange(recipe.id, saved)}
                    />
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

      <RecipePreviewModal
        recipe={preview}
        open={previewOpen}
        canSave={canSave}
        filterQuery={filterQuery}
        onClose={() => setPreviewOpen(false)}
        onSavedChange={applySavedChange}
      />
    </div>
  );
}

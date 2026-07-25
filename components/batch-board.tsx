"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Bookmark, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  addEntry,
  moveEntry,
  duplicateEntry,
  removeEntry,
  addDay,
  removeDay,
} from "@/app/[locale]/batch/actions";
import {
  dayProteinG,
  dayProgressPct,
  isDayComplete,
  batchQuota,
} from "@/lib/nutrition";
import { showUndoToast } from "@/components/undo-toast";
import { ProteinGauge } from "@/components/protein-gauge";
import { RecipeDetail } from "@/components/recipe-detail";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Palette recipes carry the full detail so the preview modal renders without a fetch.
type Recipe = {
  id: string;
  title: string;
  proteinPerServingG: number | null;
  summary: string | null;
  caloriesPerServingKcal: number | null;
  steps: string[];
  saved: boolean;
};
type Entry = {
  id: string;
  recipeId: string;
  dayIndex: number;
  title: string;
  proteinPerServingG: number | null;
};

export function BatchBoard({
  planId,
  initialEntries,
  initialDayCount,
  recipes,
  targetG,
}: {
  planId: string;
  initialEntries: Entry[];
  initialDayCount: number;
  recipes: Recipe[];
  targetG: number | null;
}) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [dayCount, setDayCount] = useState(initialDayCount);
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [draggingKind, setDraggingKind] = useState<string | null>(null);
  // Read-only preview modal. `previewRecipe` is kept even while closing so the panel
  // still has content during the exit animation; `previewOrigin` is the source point
  // (relative to viewport center) the panel flies in from.
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);
  const [previewOrigin, setPreviewOrigin] = useState({ dx: 0, dy: 0 });
  // Tap-to-add: the palette recipe whose "add to which day?" picker is open (null =
  // closed). The primary mobile path for adding a recipe without drag.
  const [addFor, setAddFor] = useState<Recipe | null>(null);
  // Flying clone shown under the cursor while dragging, so the source (a palette
  // recipe, or a dish being moved) stays visibly in place.
  const [overlay, setOverlay] = useState<{
    title: string;
    proteinPerServingG: number | null;
  } | null>(null);
  const [, startTransition] = useTransition();
  const shiftRef = useRef(false);
  const tempId = useRef(0);
  // Root namespace: this component needs both `batch.*` and `common.*` messages.
  const t = useTranslations();
  const recipeById = useMemo(
    () => new Map(recipes.map((r) => [r.id, r])),
    [recipes],
  );

  function openPreview(recipe: Recipe, source: HTMLElement) {
    const rect = source.getBoundingClientRect();
    setPreviewOrigin({
      dx: rect.left + rect.width / 2 - window.innerWidth / 2,
      dy: rect.top + rect.height / 2 - window.innerHeight / 2,
    });
    setPreviewRecipe(recipe);
    setPreviewOpen(true);
  }

  // For a dish already placed in a day: look the full recipe up by id (entries only
  // carry title + protein; the modal needs summary + steps).
  function openPreviewById(recipeId: string, source: HTMLElement) {
    const recipe = recipeById.get(recipeId);
    if (recipe) openPreview(recipe, source);
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Shift") shiftRef.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Shift") shiftRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Stable id for the DndContext so dnd-kit's generated aria ids match between server
  // and client render (avoids a hydration mismatch on aria-describedby).
  const dndId = useId();
  // Mouse: drag starts after a small move. Touch: press-and-hold 200ms to drag, so a
  // quick swipe scrolls the page instead of hijacking it into a drag (tap-first,
  // PRINCIPLES §5 — on mobile the primary path is the "+" tap-to-add, not drag).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const byDay = useMemo(() => {
    const grouped: Entry[][] = Array.from({ length: dayCount }, () => []);
    for (const e of entries) {
      if (e.dayIndex >= 0 && e.dayIndex < dayCount) grouped[e.dayIndex].push(e);
    }
    return grouped;
  }, [entries, dayCount]);

  const greenDays = byDay.filter((dayEntries) =>
    isDayComplete(dayProteinG(dayEntries), targetG),
  ).length;
  const avgPerDay = dayCount
    ? Math.round(
        entries.reduce((s, e) => s + (e.proteinPerServingG ?? 0), 0) / dayCount,
      )
    : 0;

  // --- Mutations (optimistic local state + persisted Server Action) ---
  function addRecipeToDay(recipeId: string, dayIndex: number) {
    const recipe = recipeById.get(recipeId);
    if (!recipe) return;
    const temp = `temp-${tempId.current++}`;
    setEntries((prev) => [
      ...prev,
      {
        id: temp,
        recipeId,
        dayIndex,
        title: recipe.title,
        proteinPerServingG: recipe.proteinPerServingG,
      },
    ]);
    startTransition(async () => {
      const realId = await addEntry(planId, dayIndex, recipeId);
      setEntries((prev) =>
        realId
          ? prev.map((e) => (e.id === temp ? { ...e, id: realId } : e))
          : prev.filter((e) => e.id !== temp),
      );
    });
  }

  function moveEntryToDay(entryId: string, dayIndex: number) {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, dayIndex } : e)),
    );
    startTransition(() => moveEntry(entryId, dayIndex));
  }

  function duplicateToDay(entryId: string, dayIndex: number) {
    const source = entries.find((e) => e.id === entryId);
    if (!source) return;
    const temp = `temp-${tempId.current++}`;
    setEntries((prev) => [...prev, { ...source, id: temp, dayIndex }]);
    startTransition(async () => {
      const realId = await duplicateEntry(entryId, dayIndex);
      setEntries((prev) =>
        realId
          ? prev.map((e) => (e.id === temp ? { ...e, id: realId } : e))
          : prev.filter((e) => e.id !== temp),
      );
    });
  }

  function remove(entryId: string) {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    startTransition(() => removeEntry(entryId));
  }

  function onAddDay() {
    setDayCount((n) => n + 1);
    startTransition(() => addDay(planId));
  }

  function onRemoveDay(dayIndex: number) {
    if (dayCount <= 1) return;
    const dayHasEntries = entries.some((e) => e.dayIndex === dayIndex);
    // Snapshot to restore on undo (deferred delete — nothing is persisted until commit).
    const snapshotEntries = entries;
    const snapshotDayCount = dayCount;
    setEntries((prev) =>
      prev
        .filter((e) => e.dayIndex !== dayIndex)
        .map((e) =>
          e.dayIndex > dayIndex ? { ...e, dayIndex: e.dayIndex - 1 } : e,
        ),
    );
    setDayCount((n) => n - 1);
    // An empty day has nothing worth restoring — remove it straight away, no undo noise.
    if (!dayHasEntries) {
      startTransition(() => removeDay(planId, dayIndex));
      return;
    }
    showUndoToast({
      message: t("batch.dayDeleted"),
      actionLabel: t("common.undo"),
      onUndo: () => {
        setEntries(snapshotEntries);
        setDayCount(snapshotDayCount);
      },
      onCommit: () => startTransition(() => removeDay(planId, dayIndex)),
    });
  }

  function onDragStart(event: DragStartEvent) {
    const a = event.active.data.current as
      | { kind?: string; recipeId?: string; entryId?: string }
      | undefined;
    setDraggingKind(a?.kind ?? null);
    if (a?.kind === "recipe") {
      const recipe = recipeById.get(a.recipeId!);
      setOverlay(recipe ? { title: recipe.title, proteinPerServingG: recipe.proteinPerServingG } : null);
    } else if (a?.kind === "entry") {
      const entry = entries.find((e) => e.id === a.entryId);
      setOverlay(entry ? { title: entry.title, proteinPerServingG: entry.proteinPerServingG } : null);
    }
  }

  function clearDrag() {
    setDraggingKind(null);
    setOverlay(null);
  }

  function onDragEnd(event: DragEndEvent) {
    clearDrag();
    const a = event.active.data.current as
      | { kind: string; recipeId?: string; entryId?: string }
      | undefined;
    const o = event.over?.data.current as
      | { kind: string; dayIndex?: number }
      | undefined;
    if (!a || !o) return;

    if (a.kind === "recipe" && o.kind === "day" && a.recipeId != null) {
      addRecipeToDay(a.recipeId, o.dayIndex!);
    } else if (a.kind === "entry" && a.entryId != null) {
      if (o.kind === "remove") remove(a.entryId);
      else if (o.kind === "day") {
        if (shiftRef.current) duplicateToDay(a.entryId, o.dayIndex!);
        else moveEntryToDay(a.entryId, o.dayIndex!);
      }
    }
  }

  const filteredRecipes = recipes.filter(
    (r) =>
      (!favoritesOnly || r.saved) &&
      r.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const quota = batchQuota(entries);
  // Top batch bar: a CONTINUOUS protein ratio so it advances with each dish (not by whole
  // days). Each day's contribution is capped at the daily target so one overloaded day
  // can't mask an empty one — it reaches 100% exactly when every day hits its target.
  const hasTarget = targetG != null && targetG > 0;
  const batchGoalG = hasTarget ? targetG * dayCount : 0;
  const batchFilledG = hasTarget
    ? byDay.reduce(
        (sum, dayEntries) => sum + Math.min(dayProteinG(dayEntries), targetG),
        0,
      )
    : 0;
  const progressPct =
    batchGoalG > 0 ? Math.round((batchFilledG / batchGoalG) * 100) : 0;

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={clearDrag}
    >
      {/* Batch summary. On mobile it sticks to the top while you scroll the days, so the
          progression stays in view (the global header scrolls away underneath). One sticky
          bar only — we don't stack several (mobile vertical budget). */}
      <div className="mb-5 flex flex-wrap items-center gap-5 rounded-2xl border bg-card p-4 max-md:sticky max-md:top-0 max-md:z-20 max-md:shadow-sm">
        <div className="min-w-45 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="font-semibold">{t("batch.progressLabel")}</span>
            <span className="font-mono text-muted-foreground">
              {hasTarget ? `${batchFilledG} / ${batchGoalG} g` : `${greenDays}/${dayCount}`}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-[width] duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <div className="font-display text-2xl leading-none">{avgPerDay}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            {t("batch.averageLabel")}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        {/* Palette (also the "range/remove" drop zone while dragging a dish) */}
        <PaletteZone active={draggingKind === "entry"}>
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t("batch.recipes")}
          </h2>
          <div className="relative mb-2">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("batch.searchPlaceholder")}
              aria-label={t("batch.searchPlaceholder")}
              className="w-full rounded-lg border border-input bg-background py-1.5 pl-8 pr-2 text-sm outline-none focus-visible:border-ring"
            />
          </div>
          {/* Favorites filter — the palette shows public + own recipes by default (never
              empty), narrow to saved ones here. */}
          <button
            type="button"
            onClick={() => setFavoritesOnly((v) => !v)}
            aria-pressed={favoritesOnly}
            className={cn(
              "mb-2 flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors",
              favoritesOnly
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Bookmark
              className={cn("size-3.5", favoritesOnly && "fill-primary")}
              aria-hidden
            />
            {t("recipes.filters.favorites")}
          </button>
          {/* Bounded height so a long list scrolls inside the palette instead of
              stretching the page (the palette is sticky on desktop). */}
          <div className="flex max-h-[24rem] flex-col gap-2 overflow-y-auto md:max-h-[calc(100vh-11rem)]">
            {filteredRecipes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("batch.noRecipe")}
              </p>
            ) : (
              filteredRecipes.map((recipe) => (
                <RecipeChip
                  key={recipe.id}
                  draggableId={`recipe:${recipe.id}`}
                  draggableData={{ kind: "recipe", recipeId: recipe.id }}
                  title={recipe.title}
                  proteinPerServingG={recipe.proteinPerServingG}
                  onPreview={(source) => openPreview(recipe, source)}
                  onAdd={() => setAddFor(recipe)}
                />
              ))
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="md:hidden">{t("batch.tapHint")}</span>
            <span className="hidden md:inline">{t("batch.dragHint")}</span>
          </p>
        </PaletteZone>

        {/* Days + add-day + quota */}
        <div>
          <div className="flex flex-col gap-3">
            {byDay.map((dayEntries, dayIndex) => (
              <DayRow
                key={dayIndex}
                dayIndex={dayIndex}
                entries={dayEntries}
                targetG={targetG}
                canRemove={dayCount > 1}
                onRemoveDay={() => onRemoveDay(dayIndex)}
                onRemoveEntry={remove}
                onPreviewRecipe={openPreviewById}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onAddDay}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="size-4" aria-hidden />
            {t("batch.addDay")}
          </button>

          <section className="mt-8 rounded-2xl border bg-card p-5">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">
              {t("batch.toCook")}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("batch.toCookHint")}
            </p>
            {Object.keys(quota).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("batch.emptyDay")}
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {Object.entries(quota).map(([recipeId, portions]) => {
                  const recipe = recipeById.get(recipeId);
                  return (
                    <li
                      key={recipeId}
                      className="flex items-center gap-3 rounded-xl border p-3"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {recipe?.title ?? "—"}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {t("batch.perServing", {
                            grams: recipe?.proteinPerServingG ?? "—",
                          })}
                        </span>
                      </span>
                      <span className="font-display text-2xl text-accent-warm">
                        {t("batch.times", { count: portions })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* The flying clone that follows the cursor (source stays in place). */}
      <DragOverlay dropAnimation={null}>
        {overlay ? (
          <div className={cn(chipCardClass, "cursor-grabbing border-primary shadow-xl")}>
            <ChipBody
              title={overlay.title}
              proteinPerServingG={overlay.proteinPerServingG}
            />
          </div>
        ) : null}
      </DragOverlay>

      {/* Read-only recipe preview — "what am I eating?" — without leaving the composer.
          Flies in from the chip that was tapped (--dx/--dy). */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          style={
            {
              "--dx": `${previewOrigin.dx}px`,
              "--dy": `${previewOrigin.dy}px`,
            } as CSSProperties
          }
        >
          {previewRecipe && (
            <>
              <DialogHeader>
                <DialogTitle>{previewRecipe.title}</DialogTitle>
              </DialogHeader>
              <RecipeDetail recipe={previewRecipe} />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Tap-to-add: pick a day for the recipe (the drag-free add path, mobile-first).
          Each day shows its current protein so you can fill the gauge that needs it. */}
      <Dialog
        open={addFor !== null}
        onOpenChange={(open) => !open && setAddFor(null)}
      >
        <DialogContent className="max-w-sm">
          {addFor && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t("batch.addToDay", { title: addFor.title })}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2">
                {byDay.map((dayEntries, dayIndex) => (
                  <button
                    key={dayIndex}
                    type="button"
                    onClick={() => {
                      addRecipeToDay(addFor.id, dayIndex);
                      setAddFor(null);
                    }}
                    className="flex min-h-11 flex-col items-start justify-center rounded-xl border bg-secondary px-3 py-2 text-left transition-colors hover:border-primary"
                  >
                    <span className="font-display text-sm font-bold uppercase tracking-wide">
                      {t("batch.dayLabel", { number: dayIndex + 1 })}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {dayProteinG(dayEntries)} / {targetG ?? "—"} g
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}

// --- Subcomponents ---------------------------------------------------------

function PaletteZone({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations("batch");
  const { setNodeRef, isOver } = useDroppable({
    id: "remove",
    data: { kind: "remove" },
  });
  return (
    <aside
      ref={setNodeRef}
      className={cn(
        "self-start rounded-2xl border bg-card p-4 transition-colors md:sticky md:top-4",
        active && "border-dashed border-destructive",
        active && isOver && "bg-destructive/10",
      )}
    >
      {active ? (
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-destructive">
          <Trash2 className="size-4" aria-hidden />
          {t("removeZone")}
        </p>
      ) : null}
      <div className={active ? "opacity-40" : ""}>{children}</div>
    </aside>
  );
}

// Shared visual for a recipe chip — used by the palette/day chips AND the drag clone,
// so the element you drag looks EXACTLY like the one you picked up (same column layout,
// clamped title, protein placement, size). Interactivity/cursor is layered per use.
const chipCardClass =
  "relative flex flex-col justify-between gap-1 rounded-xl border bg-card p-2.5 pr-16 text-left shadow-sm md:pr-14";

function ChipBody({
  title,
  proteinPerServingG,
  count,
}: {
  title: string;
  proteinPerServingG: number | null;
  count?: number;
}) {
  return (
    <>
      <span className="line-clamp-2 text-sm font-semibold leading-tight">
        {title}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="font-mono text-xs font-bold text-accent-warm">
          {proteinPerServingG ?? "—"} g
        </span>
        {count && count > 1 ? (
          <span className="rounded-full bg-primary/10 px-1.5 font-display text-xs font-bold text-primary">
            ×{count}
          </span>
        ) : null}
      </span>
    </>
  );
}

// A single recipe card, used both in the left palette and inside a day. Same design
// everywhere; the difference is the corner actions: an eye (preview) always, a "+"
// (tap-to-add) when `onAdd` is given (palette), and a trash (remove) when `onRemove`
// is given (days) — so a palette recipe can't be deleted. The whole card is the drag
// handle; corner buttons stop the pointer from starting a drag so their clicks land.
// `fadeWhenDragging` ghosts the source on a real move (a placed dish); the palette
// source stays visible (the DragOverlay shows the clone).
//
// Corner actions are always visible on touch (no hover there — tap-first, PRINCIPLES
// §5) and ghost-on-hover from md up.
function RecipeChip({
  draggableId,
  draggableData,
  title,
  proteinPerServingG,
  count,
  onPreview,
  onAdd,
  onRemove,
  fadeWhenDragging = false,
}: {
  draggableId: string;
  draggableData: Record<string, unknown>;
  title: string;
  proteinPerServingG: number | null;
  count?: number;
  onPreview: (source: HTMLElement) => void;
  onAdd?: () => void;
  onRemove?: () => void;
  fadeWhenDragging?: boolean;
}) {
  const t = useTranslations("batch");
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableId,
    data: draggableData,
  });
  const actionClass =
    "grid size-7 place-items-center rounded-md text-muted-foreground transition-opacity hover:bg-muted focus-visible:opacity-100 md:size-6 md:opacity-0 md:group-hover/chip:opacity-100";
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        chipCardClass,
        "group/chip cursor-grab transition-colors hover:border-primary",
        fadeWhenDragging && isDragging && "opacity-40",
      )}
    >
      <ChipBody title={title} proteinPerServingG={proteinPerServingG} count={count} />
      <div className="absolute right-1 top-1 flex gap-0.5">
        {onAdd && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onAdd}
            aria-label={t("add")}
            className={cn(actionClass, "hover:text-primary")}
          >
            <Plus className="size-4 md:size-3.5" aria-hidden />
          </button>
        )}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => onPreview(e.currentTarget)}
          aria-label={t("preview")}
          className={cn(actionClass, "hover:text-primary")}
        >
          <Eye className="size-4 md:size-3.5" aria-hidden />
        </button>
        {onRemove && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onRemove}
            aria-label={t("removeDish")}
            className={cn(actionClass, "hover:text-destructive")}
          >
            <Trash2 className="size-4 md:size-3.5" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

// Collapse a day's entries into one group per recipe (one entry = one part), preserving
// first-seen order so chips don't jump around as parts are added/removed.
type EntryGroup = {
  recipeId: string;
  title: string;
  proteinPerServingG: number | null;
  entryIds: string[];
};
function groupByRecipe(entries: Entry[]): EntryGroup[] {
  const groups = new Map<string, EntryGroup>();
  for (const entry of entries) {
    const group = groups.get(entry.recipeId);
    if (group) group.entryIds.push(entry.id);
    else
      groups.set(entry.recipeId, {
        recipeId: entry.recipeId,
        title: entry.title,
        proteinPerServingG: entry.proteinPerServingG,
        entryIds: [entry.id],
      });
  }
  return [...groups.values()];
}

function DayRow({
  dayIndex,
  entries,
  targetG,
  canRemove,
  onRemoveDay,
  onRemoveEntry,
  onPreviewRecipe,
}: {
  dayIndex: number;
  entries: Entry[];
  targetG: number | null;
  canRemove: boolean;
  onRemoveDay: () => void;
  onRemoveEntry: (entryId: string) => void;
  onPreviewRecipe: (recipeId: string, source: HTMLElement) => void;
}) {
  const t = useTranslations("batch");
  const { setNodeRef, isOver } = useDroppable({
    id: `day:${dayIndex}`,
    data: { kind: "day", dayIndex },
  });
  const total = dayProteinG(entries);
  const pct = dayProgressPct(total, targetG);
  const done = isDayComplete(total, targetG);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative flex flex-wrap gap-4 rounded-2xl border bg-card p-4 pr-10 transition-colors",
        done && "border-primary/55",
        isOver && "border-primary bg-primary/5",
      )}
    >
      {/* Delete-day, top-right. Always visible on touch (no hover there — tap-first,
          PRINCIPLES §5); ghost-on-hover from md up. */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemoveDay}
          aria-label={t("removeDayLabel")}
          className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-md text-muted-foreground transition-opacity hover:text-destructive focus-visible:opacity-100 md:size-7 md:opacity-0 md:group-hover:opacity-100"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      )}

      {/* Left: label + protein gauge */}
      <div className="flex w-37.5 shrink-0 flex-col gap-2">
        <span className="font-display text-lg font-bold uppercase tracking-wide">
          {t("dayLabel", { number: dayIndex + 1 })}
        </span>
        <div className="flex items-center gap-2.5">
          <ProteinGauge fill={pct} sealed={done} />
          <div className="flex flex-col leading-none">
            <b className="font-display text-2xl">{total}</b>
            <span className="mt-0.5 text-xs text-muted-foreground">
              / {targetG ?? "—"} g
            </span>
          </div>
        </div>
      </div>

      {/* Right: dishes. Same recipe placed several times = ONE chip with ×N (one entry
          per part). Dragging moves one part; the trash removes one part. */}
      <div className="flex-1">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dropHere")}</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
            {groupByRecipe(entries).map((group) => (
              <RecipeChip
                key={group.recipeId}
                draggableId={`entry:${group.entryIds[0]}`}
                draggableData={{ kind: "entry", entryId: group.entryIds[0] }}
                title={group.title}
                proteinPerServingG={group.proteinPerServingG}
                count={group.entryIds.length}
                onPreview={(source) => onPreviewRecipe(group.recipeId, source)}
                onRemove={() =>
                  onRemoveEntry(group.entryIds[group.entryIds.length - 1])
                }
                fadeWhenDragging
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

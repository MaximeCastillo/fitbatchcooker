"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Check, Plus, Search, Trash2, X } from "lucide-react";
import {
  addEntry,
  moveEntry,
  duplicateEntry,
  removeEntry,
  addDay,
  removeDay,
} from "@/app/batch/actions";
import {
  dayProteinG,
  dayProgressPct,
  isDayComplete,
  batchQuota,
} from "@/lib/nutrition";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

type Recipe = { id: string; title: string; proteinPerServingG: number | null };
type Entry = {
  id: string;
  recipeId: string;
  dayIndex: number;
  servings: number;
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
  const [draggingKind, setDraggingKind] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const shiftRef = useRef(false);
  const tempId = useRef(0);
  const recipeById = useMemo(
    () => new Map(recipes.map((r) => [r.id, r])),
    [recipes],
  );

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
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
        entries.reduce(
          (s, e) => s + (e.proteinPerServingG ?? 0) * e.servings,
          0,
        ) / dayCount,
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
        servings: 1,
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
    if (dayCount <= 1 || byDay[dayIndex].length > 0) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.dayIndex > dayIndex ? { ...e, dayIndex: e.dayIndex - 1 } : e,
      ),
    );
    setDayCount((n) => n - 1);
    startTransition(() => removeDay(planId, dayIndex));
  }

  function onDragStart(event: DragStartEvent) {
    setDraggingKind(
      (event.active.data.current as { kind?: string })?.kind ?? null,
    );
  }

  function onDragEnd(event: DragEndEvent) {
    setDraggingKind(null);
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

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const quota = batchQuota(entries);
  const progressPct = dayCount ? Math.round((greenDays / dayCount) * 100) : 0;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDraggingKind(null)}
    >
      {/* Batch summary */}
      <div className="mb-5 flex flex-wrap items-center gap-5 rounded-2xl border bg-card p-4">
        <div className="min-w-45 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="font-semibold">{strings.batch.progressLabel}</span>
            <span className="font-mono text-muted-foreground">
              {greenDays}/{dayCount}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <div className="font-display text-2xl leading-none">{avgPerDay}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            {strings.batch.averageLabel}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        {/* Palette (also the "range/remove" drop zone while dragging a dish) */}
        <PaletteZone active={draggingKind === "entry"}>
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {strings.batch.recipes}
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
              placeholder={strings.batch.searchPlaceholder}
              aria-label={strings.batch.searchPlaceholder}
              className="w-full rounded-lg border border-input bg-background py-1.5 pl-8 pr-2 text-sm outline-none focus-visible:border-ring"
            />
          </div>
          <div className="flex flex-col gap-2">
            {filteredRecipes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {strings.batch.noRecipe}
              </p>
            ) : (
              filteredRecipes.map((recipe) => (
                <PaletteChip key={recipe.id} recipe={recipe} />
              ))
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {strings.batch.dragHint}
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
                canRemove={dayCount > 1 && dayEntries.length === 0}
                onRemoveDay={() => onRemoveDay(dayIndex)}
                onRemoveEntry={remove}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onAddDay}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="size-4" aria-hidden />
            {strings.batch.addDay}
          </button>

          <section className="mt-8 rounded-2xl border bg-card p-5">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">
              {strings.batch.toCook}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {strings.batch.toCookHint}
            </p>
            {Object.keys(quota).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {strings.batch.emptyDay}
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
                          {strings.batch.perServing(
                            recipe?.proteinPerServingG ?? null,
                          )}
                        </span>
                      </span>
                      <span className="font-display text-2xl text-accent-warm">
                        {strings.batch.times(portions)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
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
  const { setNodeRef, isOver } = useDroppable({
    id: "remove",
    data: { kind: "remove" },
  });
  return (
    <aside
      ref={setNodeRef}
      className={cn(
        "sticky top-4 self-start rounded-2xl border bg-card p-4 transition-colors",
        active && "border-dashed border-destructive",
        active && isOver && "bg-destructive/10",
      )}
    >
      {active ? (
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-destructive">
          <Trash2 className="size-4" aria-hidden />
          {strings.batch.removeZone}
        </p>
      ) : null}
      <div className={active ? "opacity-40" : ""}>{children}</div>
    </aside>
  );
}

function PaletteChip({ recipe }: { recipe: Recipe }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `recipe:${recipe.id}`,
      data: { kind: "recipe", recipeId: recipe.id },
    });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
          : undefined
      }
      className={cn(
        "flex cursor-grab items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2 text-left hover:border-primary",
        isDragging && "opacity-50",
      )}
    >
      <span className="text-sm font-semibold leading-tight">{recipe.title}</span>
      <span className="font-mono text-xs font-bold text-accent-warm">
        {recipe.proteinPerServingG ?? "—"} g
      </span>
    </button>
  );
}

function DayRow({
  dayIndex,
  entries,
  targetG,
  canRemove,
  onRemoveDay,
  onRemoveEntry,
}: {
  dayIndex: number;
  entries: Entry[];
  targetG: number | null;
  canRemove: boolean;
  onRemoveDay: () => void;
  onRemoveEntry: (entryId: string) => void;
}) {
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
        "group relative flex flex-wrap gap-4 rounded-2xl border bg-card p-4 transition-colors",
        done && "border-primary/55",
        isOver && "border-primary bg-primary/5",
      )}
    >
      {/* Ghost delete-day, top-right, appears on hover/focus */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemoveDay}
          aria-label={strings.batch.removeDayLabel}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      )}

      {/* Left: label + vessel gauge */}
      <div className="flex w-37.5 shrink-0 flex-col gap-2">
        <span className="font-display text-lg font-bold uppercase tracking-wide">
          {strings.batch.dayLabel(dayIndex + 1)}
        </span>
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "relative h-13 w-9 shrink-0 overflow-hidden rounded-[8px] border-2 bg-secondary",
              done ? "border-primary" : "border-muted-foreground/50",
            )}
          >
            <div
              className="absolute inset-x-0 bottom-0 bg-primary transition-[height]"
              style={{ height: `${pct}%` }}
              aria-hidden
            />
            {done && (
              <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" aria-hidden />
              </span>
            )}
          </div>
          <div className="flex flex-col leading-none">
            <b className="font-display text-2xl">{total}</b>
            <span className="mt-0.5 text-xs text-muted-foreground">
              / {targetG ?? "—"} g
            </span>
          </div>
        </div>
      </div>

      {/* Right: dishes */}
      <div className="flex-1">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{strings.batch.dropHere}</p>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
            {entries.map((entry) => (
              <Dish key={entry.id} entry={entry} onRemove={onRemoveEntry} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Dish({
  entry,
  onRemove,
}: {
  entry: Entry;
  onRemove: (entryId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `entry:${entry.id}`,
      data: { kind: "entry", entryId: entry.id },
    });
  return (
    <li
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
          : undefined
      }
      className={cn(
        "group/dish relative flex cursor-grab flex-col justify-between gap-1 rounded-xl border bg-secondary p-2.5 pr-7",
        isDragging && "opacity-50",
      )}
      {...listeners}
      {...attributes}
    >
      <span className="line-clamp-2 text-sm font-semibold leading-tight">
        {entry.title}
      </span>
      <span className="font-mono text-xs font-bold text-accent-warm">
        {entry.proteinPerServingG ?? "—"} g
      </span>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(entry.id)}
        aria-label={strings.batch.removeDish}
        className="absolute right-1 top-1 rounded-md p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-accent-warm focus-visible:opacity-100 group-hover/dish:opacity-100"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </li>
  );
}

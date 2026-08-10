"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { createBatch, deleteBatch } from "@/app/[locale]/batch/actions";
import { ProteinGauge } from "@/components/protein-gauge";
import { showUndoToast } from "@/components/undo-toast";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type BatchCard = {
  id: string;
  name: string | null;
  dayCount: number;
  entryCount: number;
};

// Client list so a batch can be deleted with an undoable toast (deferred delete) — no
// modal, no accidental loss of minutes of work. Reuses showUndoToast (same as day delete).
export function BatchList({
  initialBatches,
  hasTarget,
}: {
  initialBatches: BatchCard[];
  hasTarget: boolean;
}) {
  const [batches, setBatches] = useState(initialBatches);
  const [, startTransition] = useTransition();
  const t = useTranslations();

  function onDelete(id: string) {
    const snapshot = batches;
    setBatches((prev) => prev.filter((b) => b.id !== id));
    showUndoToast({
      message: t("batch.deleted"),
      actionLabel: t("common.undo"),
      onUndo: () => setBatches(snapshot),
      onCommit: () => startTransition(() => deleteBatch(id)),
    });
  }

  // The very first screen of a new account. It carries the CTA itself (rather than only the
  // page header) because an empty state can't be skipped or forgotten the way a tour can —
  // and it's the fallback for anyone who skipped the welcome screen.
  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed px-6 py-12 text-center">
        {/* The signature motif: three days, two filled — what a finished batch looks like. */}
        <div className="flex items-end gap-2" aria-hidden>
          <ProteinGauge fill={100} sealed className="h-14 w-10" />
          <ProteinGauge fill={100} sealed className="h-14 w-10" />
          <ProteinGauge fill={45} className="h-14 w-10" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-xl font-bold tracking-wide uppercase">
            {t("batch.emptyTitle")}
          </h2>
          <p className="max-w-sm text-muted-foreground">{t("batch.empty")}</p>
        </div>

        <form action={createBatch}>
          <Button type="submit" className="h-11 px-5 text-base">
            <Plus className="size-4" aria-hidden />
            {t("batch.new")}
          </Button>
        </form>

        {/* Without a target every gauge stays at 0, so this is a blocker, not a detail. */}
        {!hasTarget && (
          <p className="text-sm text-muted-foreground">
            {t("batch.noTarget")}{" "}
            <Link
              href="/welcome"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("batch.setTarget")}
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {batches.map((batch) => (
        <li key={batch.id} className="group relative">
          <Link
            href={`/batch/${batch.id}`}
            className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-primary"
          >
            <span className="pr-11 font-display text-xl font-bold uppercase tracking-wide">
              {batch.name ?? t("batch.untitled")}
            </span>
            <span className="mt-auto flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                {t("batch.days", { count: batch.dayCount })}
              </span>
              <span aria-hidden>·</span>
              <span>{t("batch.dishes", { count: batch.entryCount })}</span>
            </span>
          </Link>
          {/* Always visible on touch (no hover there — tap-first, PRINCIPLES §5);
              ghost-on-hover from md up. */}
          <button
            type="button"
            onClick={() => onDelete(batch.id)}
            aria-label={t("batch.delete")}
            className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-md text-muted-foreground transition-opacity hover:text-destructive focus-visible:opacity-100 md:size-8 md:opacity-0 md:group-hover:opacity-100"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarDays, Trash2 } from "lucide-react";
import { deleteBatch } from "@/app/batch/actions";
import { showUndoToast } from "@/components/undo-toast";
import { strings } from "@/lib/strings";

type BatchCard = {
  id: string;
  name: string | null;
  dayCount: number;
  entryCount: number;
};

// Client list so a batch can be deleted with an undoable toast (deferred delete) — no
// modal, no accidental loss of minutes of work. Reuses showUndoToast (same as day delete).
export function BatchList({ initialBatches }: { initialBatches: BatchCard[] }) {
  const [batches, setBatches] = useState(initialBatches);
  const [, startTransition] = useTransition();

  function onDelete(id: string) {
    const snapshot = batches;
    setBatches((prev) => prev.filter((b) => b.id !== id));
    showUndoToast({
      message: strings.batch.deleted,
      actionLabel: strings.common.undo,
      onUndo: () => setBatches(snapshot),
      onCommit: () => startTransition(() => deleteBatch(id)),
    });
  }

  if (batches.length === 0) {
    return <p className="text-muted-foreground">{strings.batch.empty}</p>;
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
              {batch.name ?? strings.batch.untitled}
            </span>
            <span className="mt-auto flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                {strings.batch.days(batch.dayCount)}
              </span>
              <span aria-hidden>·</span>
              <span>{strings.batch.dishes(batch.entryCount)}</span>
            </span>
          </Link>
          {/* Always visible on touch (no hover there — tap-first, PRINCIPLES §5);
              ghost-on-hover from md up. */}
          <button
            type="button"
            onClick={() => onDelete(batch.id)}
            aria-label={strings.batch.delete}
            className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-md text-muted-foreground transition-opacity hover:text-destructive focus-visible:opacity-100 md:size-8 md:opacity-0 md:group-hover:opacity-100"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

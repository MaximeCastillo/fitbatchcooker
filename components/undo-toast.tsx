"use client";

import { toast } from "sonner";
import { Undo2 } from "lucide-react";

// Deferred, undoable action (Notion-style), reusable across the app (day, batch, dish…).
// The caller applies the change optimistically, then calls this. We show a prominent toast
// with a depleting countdown bar; if undone within the delay we run onUndo (nothing was
// persisted), otherwise onCommit runs. Deferring the real delete makes cascade-undo free.
export function showUndoToast({
  message,
  actionLabel,
  onUndo,
  onCommit,
  duration = 5000,
}: {
  message: string;
  actionLabel: string;
  onUndo: () => void;
  onCommit: () => void;
  duration?: number;
}) {
  const timer = setTimeout(onCommit, duration);
  toast.custom(
    (id) => (
      <div className="relative w-[340px] max-w-[90vw] overflow-hidden rounded-xl border bg-card px-4 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex-1 text-sm font-medium">{message}</span>
          <button
            type="button"
            onClick={() => {
              clearTimeout(timer);
              onUndo();
              toast.dismiss(id);
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Undo2 className="size-4" aria-hidden />
            {actionLabel}
          </button>
        </div>
        <span
          className="absolute inset-x-0 bottom-0 h-1 origin-left bg-primary/60 motion-reduce:hidden"
          style={{ animation: `undo-countdown ${duration}ms linear forwards` }}
          aria-hidden
        />
      </div>
    ),
    { duration },
  );
}

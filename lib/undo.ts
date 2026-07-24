import { toast } from "sonner";

// Deferred, undoable action (Notion-style): the caller applies the change optimistically
// in the UI, then calls this. We show an "Undo" toast; if the user undoes within the
// delay we run onUndo (nothing was persisted), otherwise onCommit runs after the delay.
// Because the real (DB) delete is deferred to onCommit, undoing a cascade is free — we
// never deleted anything. Reusable across the app (day, batch, dish…).
export function undoableToast({
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
  toast(message, {
    duration,
    action: {
      label: actionLabel,
      onClick: () => {
        clearTimeout(timer);
        onUndo();
      },
    },
  });
}

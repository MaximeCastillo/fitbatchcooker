"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { deleteAccounts } from "@/app/[locale]/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// One row as the page hands it over: already formatted and already judged server-side
// (isSelf), so this component only tracks what's checked.
export type AdminAccountRow = {
  id: string;
  email: string;
  createdAtLabel: string;
  isOnboarded: boolean;
  isSelf: boolean;
};

// The confirm button lives inside the <form>, so useFormStatus can tell us it's running
// and stop a double-submit — deletion is irreversible, a double click must not race.
function ConfirmDeleteButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={pending}
      className="h-11 flex-1 text-base"
    >
      {label}
    </Button>
  );
}

export function AdminAccounts({ accounts }: { accounts: AdminAccountRow[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const t = useTranslations("admin");

  const selectedAccounts = accounts.filter((account) =>
    selectedIds.includes(account.id),
  );

  function toggle(accountId: string) {
    setSelectedIds((current) =>
      current.includes(accountId)
        ? current.filter((id) => id !== accountId)
        : [...current, accountId],
    );
  }

  return (
    <>
      <Button
        variant="destructive"
        className="h-11 self-start text-base"
        disabled={selectedAccounts.length === 0}
        onClick={() => setIsConfirming(true)}
      >
        <Trash2 />
        {t("deleteSelection", { count: selectedAccounts.length })}
      </Button>

      <ul className="flex flex-col gap-2">
        {accounts.map((account) => (
          <li
            key={account.id}
            className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
          >
            {/* The current admin can't tick their own row — the server refuses it too
                (lib/admin.ts), this only spares the click. */}
            <input
              type="checkbox"
              className="size-5 accent-destructive disabled:opacity-40"
              checked={selectedIds.includes(account.id)}
              disabled={account.isSelf}
              onChange={() => toggle(account.id)}
              aria-label={account.email}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{account.email}</p>
              <p className="text-sm text-muted-foreground">
                {account.createdAtLabel} ·{" "}
                {account.isOnboarded ? t("onboarded") : t("notOnboarded")}
              </p>
            </div>
            {account.isSelf && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {t("youBadge")}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Mandatory confirmation: the emails about to disappear are listed in full, because
          this is permanent — no soft delete, no undo toast (unlike the batch screens). */}
      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("confirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("confirmWarning", { count: selectedAccounts.length })}
            </DialogDescription>
          </DialogHeader>

          <ul className="max-h-48 overflow-y-auto rounded-lg bg-muted/60 px-3 py-2 text-sm">
            {selectedAccounts.map((account) => (
              <li key={account.id} className="truncate py-0.5">
                {account.email}
              </li>
            ))}
          </ul>

          <form action={deleteAccounts} className="flex gap-2">
            {selectedAccounts.map((account) => (
              <input
                key={account.id}
                type="hidden"
                name="accountIds"
                value={account.id}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 text-base"
              onClick={() => setIsConfirming(false)}
            >
              {t("cancel")}
            </Button>
            <ConfirmDeleteButton label={t("confirmDelete")} />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

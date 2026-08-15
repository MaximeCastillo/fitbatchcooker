"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  updateEmail,
  updatePassword,
  type FormState,
} from "@/app/[locale]/account/actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

const initialFormState: FormState = { status: "idle", message: "" };

// Client Components so we can show inline, per-form success/error feedback via React 19's
// useActionState — no page reload, no state in the URL. The server actions stay the sole
// authority (validation + auth happen there); these components only render their result.
//
// 🆕 useActionState(action, initialState) → [state, formAction, isPending]. Think of it as
// a Rails form that re-renders in place with the flash message the action returned, except
// nothing round-trips through the URL.

const inputClasses =
  "rounded-lg border border-input bg-background px-3 py-2.5 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40";

// >=44px tap target (default Button is only h-8) — this app is tap-first.
const submitClasses = "mt-1 h-11 w-full text-base";

function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  return (
    <p
      role="status"
      className={cn(
        "text-sm",
        state.status === "success" ? "text-primary" : "text-destructive",
      )}
    >
      {state.message}
    </p>
  );
}

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, isPending] = useActionState(
    updateEmail,
    initialFormState,
  );
  const t = useTranslations("account");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("newEmail")}
        <input
          type="email"
          name="newEmail"
          required
          autoComplete="email"
          placeholder={currentEmail}
          className={inputClasses}
        />
      </label>

      <p className="text-xs text-muted-foreground">{t("emailHint")}</p>

      <FormMessage state={state} />

      <Button type="submit" disabled={isPending} className={submitClasses}>
        {t("changeEmail")}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePassword,
    initialFormState,
  );
  const t = useTranslations("account");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("currentPassword")}
        <PasswordInput
          name="currentPassword"
          required
          autoComplete="current-password"
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("newPassword")}
        <PasswordInput
          name="newPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("confirmPassword")}
        <PasswordInput
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClasses}
        />
      </label>

      <FormMessage state={state} />

      <Button type="submit" disabled={isPending} className={submitClasses}>
        {t("changePassword")}
      </Button>
    </form>
  );
}

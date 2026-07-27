"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { requestPasswordReset } from "@/app/[locale]/forgot-password/actions";
import { resetPassword } from "@/app/[locale]/reset-password/actions";
import { type FormState } from "@/app/[locale]/account/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Client Components so we can show inline success/error feedback via React 19's
// useActionState — no page reload, no state in the URL. The server actions stay the sole
// authority (validation + auth happen there); these only render their result.

const initialFormState: FormState = { status: "idle", message: "" };

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

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    initialFormState,
  );
  const t = useTranslations("forgotPassword");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("email")}
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className={inputClasses}
        />
      </label>

      <FormMessage state={state} />

      <Button type="submit" disabled={isPending} className={submitClasses}>
        {t("submit")}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    resetPassword,
    initialFormState,
  );
  const t = useTranslations("resetPassword");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("newPassword")}
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("confirmPassword")}
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClasses}
        />
      </label>

      <FormMessage state={state} />

      <Button type="submit" disabled={isPending} className={submitClasses}>
        {t("submit")}
      </Button>
    </form>
  );
}

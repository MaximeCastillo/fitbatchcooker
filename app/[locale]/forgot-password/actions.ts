"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type FormState } from "@/app/[locale]/account/actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sends a password-reset email. Anti-enumeration: on success we ALWAYS return the same
// neutral "if an account exists" message, so the form never reveals which addresses have
// an account. The email link points at our callback route, which exchanges the code for a
// (recovery) session and forwards to /reset-password.
export async function requestPasswordReset(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const t = await getTranslations("forgotPassword");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: t("emailInvalid") };
  }

  // Build the redirect target from the current origin so it works on localhost and in
  // prod alike. NOTE: each origin must be allow-listed in Supabase → Authentication →
  // URL Configuration, otherwise Supabase refuses the redirectTo.
  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ?? `https://${requestHeaders.get("host")}`;
  const redirectTo = `${origin}/api/auth/callback?next=/reset-password`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return { status: "error", message: t("error") };
  }

  return { status: "success", message: t("sent") };
}

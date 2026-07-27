"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { type FormState } from "@/app/[locale]/account/actions";

const MIN_PASSWORD_LENGTH = 8;

// Sets a new password for a user arriving from a reset link. Unlike the account
// "change password" flow, we DON'T re-verify a current password: the email link is the
// proof of identity (the callback route turned it into a recovery session). We still
// require an active session — no session means the link was invalid or expired.
export async function resetPassword(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const t = await getTranslations("resetPassword");
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: t("invalidLink") };

  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { status: "error", message: t("passwordTooShort") };
  }
  if (newPassword !== confirmPassword) {
    return { status: "error", message: t("passwordMismatch") };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { status: "error", message: t("error") };
  }

  // Password set and the recovery session is now a full session → land in the app.
  return redirect({ href: "/batch", locale: await getLocale() });
}

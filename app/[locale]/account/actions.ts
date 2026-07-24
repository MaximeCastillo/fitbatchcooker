"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { strings } from "@/lib/strings";

// Shape shared by the email/password forms (React 19 useActionState). "idle" is the
// untouched state; the client renders the message with the right tone for the status.
// (A "use server" module may only export async functions, so the initial-state value
// lives in the client component — only the type is exported here, and types are erased.)
export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Updates the current user's profile. Scoped to the session user (spec §7) — the id
// never comes from the form.
export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const firstName = String(formData.get("firstName") ?? "").trim() || null;

  const rawTarget = String(formData.get("proteinTargetG") ?? "").trim();
  const parsed = Number(rawTarget);
  const proteinTargetG =
    rawTarget !== "" && Number.isFinite(parsed) && parsed > 0
      ? Math.round(parsed)
      : null;

  await prisma.user.update({
    where: { id: user.id },
    data: { firstName, proteinTargetG },
  });

  redirect("/account?saved=1");
}

// Change the account email. The identity (current user + email) comes from the session,
// never from the form (authorization — spec §7). Supabase does NOT switch the address
// immediately: it emails a confirmation link, so we only promise "confirmation sent".
// Our public.User.email realigns itself on the next load via getCurrentUser's self-heal.
export async function updateEmail(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const newEmail = String(formData.get("newEmail") ?? "")
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(newEmail)) {
    return { status: "error", message: strings.account.emailInvalid };
  }
  if (newEmail === user.email.toLowerCase()) {
    return { status: "error", message: strings.account.emailSame };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    const taken = /registered|already|exists|taken/i.test(error.message);
    return {
      status: "error",
      message: taken ? strings.account.emailTaken : strings.account.emailError,
    };
  }

  return { status: "success", message: strings.account.emailSent };
}

// Change the account password. Security requirement: re-verify the CURRENT password
// (a fresh signInWithPassword) before allowing the change, so a hijacked/left-open
// session can't silently rotate the password. Only then do we update it.
export async function updatePassword(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { status: "error", message: strings.account.passwordTooShort };
  }
  if (newPassword !== confirmPassword) {
    return { status: "error", message: strings.account.passwordMismatch };
  }

  const supabase = await createSupabaseServerClient();

  // Re-auth: prove the person knows the current password. Uses the session email, not
  // anything from the form.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) {
    return { status: "error", message: strings.account.passwordWrong };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) {
    return { status: "error", message: strings.account.passwordError };
  }

  return { status: "success", message: strings.account.passwordUpdated };
}

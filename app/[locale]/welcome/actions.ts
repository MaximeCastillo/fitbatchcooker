"use server";

import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseProfileInput } from "@/lib/profile";
import { redirect } from "@/i18n/navigation";

// Post-signup welcome screen. Same write as updateProfile (shared parsing), but it lands
// on the batch list with the guided tour armed instead of going back to /account.
// Scoped to the session user (spec §7) — the id never comes from the form.
export async function completeOnboarding(formData: FormData) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale });

  await prisma.user.update({
    where: { id: user.id },
    data: parseProfileInput(formData),
  });

  redirect({ href: { pathname: "/batch", query: { tour: "1" } }, locale });
}

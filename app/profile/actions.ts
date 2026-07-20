"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  redirect("/profile?saved=1");
}

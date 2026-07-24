import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// The bridge between Supabase Auth (auth.users) and our app data (public.User).
//
// Returns the app User for the currently authenticated person, creating the row on
// first use — so it self-heals accounts created before this bridge existed. Returns
// null when nobody is logged in.
//
// Wrapped in React cache(): within a single request, layout + page + action share ONE
// result instead of each hitting Supabase + the DB again. And we read first (findUnique)
// and only write (create) when the row is missing — so a normal page load is a cheap
// read, not a write on every visit.
//
// Use this everywhere we need "who is logged in" on the server. It also gives us the
// `userId` to scope data queries to the current user (authorization — spec §7).
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const existing = await prisma.user.findUnique({ where: { id: user.id } });
  if (existing) {
    // Self-heal: Supabase Auth is the source of truth for the email. When it drifts
    // from our column (e.g. the user confirmed an email change on Supabase's side),
    // realign it. Still a cheap read on every load — we only write on a real mismatch.
    if (existing.email !== user.email) {
      return prisma.user.update({
        where: { id: user.id },
        data: { email: user.email },
      });
    }
    return existing;
  }

  return prisma.user.create({
    data: { id: user.id, email: user.email },
  });
});

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// The bridge between Supabase Auth (auth.users) and our app data (public.User).
//
// Returns the app User for the currently authenticated person, creating the row on
// first use (lazy upsert) — so it self-heals accounts created before this bridge
// existed. Returns null when nobody is logged in.
//
// Use this everywhere we need "who is logged in" on the server. It also gives us the
// `userId` to scope data queries to the current user (authorization — spec §7).
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  return prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email },
    create: { id: user.id, email: user.email },
  });
}

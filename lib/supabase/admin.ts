import { createClient } from "@supabase/supabase-js";

// Supabase client holding the SERVICE ROLE key — it bypasses every auth rule, so it must
// never leave the server. Kept in its own module (no "use client" file may import it) and
// read from a non-NEXT_PUBLIC_ env var, so it cannot be bundled for the browser by
// accident. Only /admin uses it, to delete rows in auth.users.
//
// 🆕 Différence avec lib/supabase/server.ts : celui-là parle AU NOM de la personne
// connectée (cookies de session, droits de l'utilisateur). Celui-ci parle au nom du
// projet — l'équivalent d'une connexion `postgres` superuser en Rails : puissant, donc
// jamais exposé et jamais utilisé pour du confort.
function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing — cannot delete auth users.");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    // No session to persist or refresh: this client is created per request and used once.
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Deletes the given accounts from Supabase Auth. Returns the ids actually deleted, so the
// caller can drop exactly those rows in our database and report the rest as failed —
// a partial failure must not silently look like a success.
export async function deleteAuthUsers(userIds: string[]): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const deletedIds: string[] = [];

  for (const userId of userIds) {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    // A user already gone from auth.users (deleted by hand in the dashboard) is not a
    // failure: the goal is "no such account", and it's reached.
    if (!error || /not.?found/i.test(error.message)) {
      deletedIds.push(userId);
    } else {
      console.error(`[admin] auth deletion failed for ${userId}:`, error.message);
    }
  }

  return deletedIds;
}

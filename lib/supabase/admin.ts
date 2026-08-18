import { createClient } from "@supabase/supabase-js";

// Supabase client holding the SERVICE ROLE key — it bypasses every auth rule, so it must
// never leave the server. Kept in its own module (no "use client" file may import it) and
// read from a non-NEXT_PUBLIC_ env var, so it cannot be bundled for the browser by
// accident. Unlike lib/supabase/server.ts, it acts as the project, not as the signed-in
// person. Used by /admin and by the E2E teardown, both to reach auth.users.
export function createSupabaseAdminClient() {
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

// Every account in Supabase Auth. Paginated because listUsers caps a page at 1000; we stop
// on the first short page. Only the E2E teardown needs this: auth.users is the one place
// where accounts survive with no matching row in our database, so it has to be read from
// the source rather than derived from Prisma.
export async function listAuthUsers(): Promise<{ id: string; email: string }[]> {
  const supabase = createSupabaseAdminClient();
  const perPage = 1000;
  const users: { id: string; email: string }[] = [];

  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listing auth users failed: ${error.message}`);

    users.push(
      ...data.users
        .filter((user) => user.email)
        .map((user) => ({ id: user.id, email: user.email! })),
    );

    if (data.users.length < perPage) return users;
  }
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for server-side use (Server Components, Server Actions, Route
// Handlers). Used ONLY for auth — application data goes through Prisma (lib/prisma.ts).
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll may be called from a Server Component, where cookies are
            // read-only. Safe to ignore — the middleware refreshes the session.
          }
        },
      },
    },
  );
}

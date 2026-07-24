"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { strings } from "@/lib/strings";

// These functions run ONLY on the server (see the "use server" directive above).
// A <form action={...}> calls them directly — no API route to write ourselves.

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent(strings.login.missingFields)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/batch");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  // Keep the user in signup mode if we bounce back with an error.
  const back = (message: string) =>
    redirect(`/login?mode=signup&error=${encodeURIComponent(message)}`);

  if (!email || !password) back(strings.login.missingFields);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) back(error.message);

  redirect("/batch");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

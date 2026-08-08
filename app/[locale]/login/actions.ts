"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";

// These functions run ONLY on the server (see the "use server" directive above).
// A <form action={...}> calls them directly — no API route to write ourselves.

export async function login(formData: FormData) {
  const locale = await getLocale();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const t = await getTranslations("login");
  if (!email || !password) {
    redirect({
      href: { pathname: "/login", query: { error: t("missingFields") } },
      locale,
    });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Supabase returns raw English messages — map the common ones to translated text.
    const message = /invalid login credentials/i.test(error.message)
      ? t("invalidCredentials")
      : t("error");
    redirect({
      href: { pathname: "/login", query: { error: message } },
      locale,
    });
  }

  redirect({ href: "/batch", locale });
}

export async function signup(formData: FormData) {
  const locale = await getLocale();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  // Keep the user in signup mode if we bounce back with an error.
  const back = (message: string) =>
    redirect({
      href: { pathname: "/login", query: { mode: "signup", error: message } },
      locale,
    });

  const t = await getTranslations("login");
  if (!email || !password) {
    back(t("missingFields"));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    // Supabase returns raw English messages — map the common ones to translated text.
    const taken = /registered|already|exists/i.test(error.message);
    back(taken ? t("emailTaken") : t("error"));
  }

  redirect({ href: "/batch", locale });
}

export async function logout() {
  const locale = await getLocale();
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale });
}

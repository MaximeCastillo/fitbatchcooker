"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Client wrapper around next-themes. It manages a `dark` class on <html>, which
// flips the token block defined in globals.css (`.dark { --... }`). Default is light;
// "Système" (enableSystem) still lets the user follow their OS preference if they pick it.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

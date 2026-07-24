"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Client wrapper around next-themes. It manages a `dark` class on <html>, which
// flips the token block defined in globals.css (`.dark { --... }`). `system`
// follows the OS preference until the user picks an explicit theme.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

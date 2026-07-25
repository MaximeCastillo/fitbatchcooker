import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import "../globals.css";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";

// Body: Barlow. Display/headings: Barlow Condensed (athletic). Numbers/macros: mono.
const barlow = Barlow({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_TAGLINE,
};

// Pre-render one variant of the shell per locale at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  // Reject unknown locales (e.g. a stray `/xx/...`) with a 404.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Distribute the locale to every Server Component of this request.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${barlow.variable} ${barlowCondensed.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (password managers, ColorZilla's
          `cz-shortcut-listen`…) inject attributes on <body> before React hydrates, which
          React reports as a mismatch. It only silences THIS element's own attributes —
          children are still diffed normally. */}
      <body className="min-h-full" suppressHydrationWarning>
        {/* NextIntlClientProvider inherits locale + messages from the request config,
            making translations available to Client Components below. */}
        <NextIntlClientProvider>
          <ThemeProvider>
            <AppShell>{children}</AppShell>
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

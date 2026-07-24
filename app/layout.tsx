// Root layout. With next-intl's `[locale]` routing, the real document shell
// (`<html>` / `<body>`, fonts, providers) lives in `app/[locale]/layout.tsx`. This
// root layout only exists because a root `not-found.tsx` requires one — it just
// passes children through.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

// Root not-found for requests that never reached a locale (not matched by the
// middleware). It renders its own document since it lives outside `[locale]`.
export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1>404 — Page not found</h1>
      </body>
    </html>
  );
}

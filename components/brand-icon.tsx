// The brand mark: a rounded-square vessel filling up with protein (a gauge) — the
// app's signature motif. The green is driven by `currentColor`, so set the wrapper's
// text color to the primary token and it adapts to light/dark themes automatically.
export function BrandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden
    >
      {/* Vessel body: a faint translucent green wash over the whole container. */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Protein fill: solid green covering the bottom ~58%, clipped to the rounded
          vessel so its corners stay rounded. */}
      <path
        d="M3 11.6 H21 V16 A5 5 0 0 1 16 21 H8 A5 5 0 0 1 3 16 Z"
        fill="currentColor"
      />
      {/* Vessel outline. */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

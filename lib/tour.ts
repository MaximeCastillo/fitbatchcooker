// Guided tour: step definitions and geometry. Pure — no DOM queries, no React — so the
// ordering, filtering and cutout math are unit-testable (this repo has no jsdom, so the
// rendering itself is covered by Playwright instead).
//
// The tour teaches the two things a new account can't discover on its own: the chef, and
// that a seeded recipe library already exists. It does NOT explain the protein goal — the
// welcome screen sets it — nor the nav item we're already standing on.

export type TourStepId = "welcome" | "chat" | "recipes" | "newBatch";

export type TourStep = {
  id: TourStepId;
  /** null = a centered bubble with no anchor (the greeting). */
  selector: string | null;
  /** Preferred side per breakpoint: the nav is a left column on desktop and a horizontal
   *  strip on mobile, so the same step wants a different side. Collision may still flip it. */
  side: {
    desktop: "top" | "bottom" | "left" | "right";
    mobile: "top" | "bottom";
  };
};

export const TOUR_STEPS: readonly TourStep[] = [
  { id: "welcome", selector: null, side: { desktop: "bottom", mobile: "bottom" } },
  {
    id: "chat",
    selector: '[data-tour="nav-chat"]',
    side: { desktop: "right", mobile: "bottom" },
  },
  {
    id: "recipes",
    selector: '[data-tour="nav-recipes"]',
    side: { desktop: "right", mobile: "bottom" },
  },
  {
    id: "newBatch",
    selector: '[data-tour="batch-new"]',
    side: { desktop: "bottom", mobile: "bottom" },
  },
];

// Drops steps whose anchor isn't on screen, keeping the declared order. Callers pass the
// ids they actually resolved in the DOM. A missing anchor must never throw or leave a bubble
// pointing at nothing — the shell differs between breakpoints and between releases.
export function resolveTourSteps(
  presentIds: ReadonlySet<TourStepId>,
): TourStep[] {
  return TOUR_STEPS.filter(
    (step) => step.selector === null || presentIds.has(step.id),
  );
}

export function clampStepIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
}

export type CutoutRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

// A full-viewport polygon with a rectangular hole, so the veil dims everything except the
// highlighted element. Same trick Base UI uses internally: the outer ring is wound
// clockwise and the hole counter-clockwise. `clip-path` also clips hit-testing, so the hole
// stays tappable.
export function cutoutPolygon(rect: CutoutRect, pad = 6): string {
  const top = Math.round(rect.top - pad);
  const right = Math.round(rect.right + pad);
  const bottom = Math.round(rect.bottom + pad);
  const left = Math.round(rect.left - pad);

  return [
    "polygon(0% 0%",
    "100% 0%",
    "100% 100%",
    "0% 100%",
    "0% 0%",
    `${left}px ${top}px`,
    `${left}px ${bottom}px`,
    `${right}px ${bottom}px`,
    `${right}px ${top}px`,
    `${left}px ${top}px)`,
  ].join(",");
}

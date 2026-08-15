"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Popover } from "@base-ui/react/popover";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  TOUR_STEPS,
  clampStepIndex,
  resolveTourSteps,
  type TourStep,
  type TourStepId,
} from "@/lib/tour";

const DESKTOP_QUERY = "(min-width: 48rem)";
const SPOTLIGHT_PAD = 6;

// Returns the element for a selector only if it's actually rendered on screen. The shell
// keeps BOTH navs in the DOM (desktop `hidden md:flex`, mobile strip) and CSS-hides one, so a
// plain querySelector would happily anchor a bubble to a 0×0 hidden node. checkVisibility
// beats offsetParent here: offsetParent is also null for a *visible* position:fixed element.
function visibleElement(selector: string): HTMLElement | null {
  for (const element of document.querySelectorAll<HTMLElement>(selector)) {
    const visible = element.checkVisibility
      ? element.checkVisibility({ checkVisibilityCSS: true })
      : element.getClientRects().length > 0;
    if (visible) return element;
  }
  return null;
}

// The greeting step has no anchor. Base UI would otherwise position it against a trigger —
// which this tour has none of — and land it at 0,0. A zero-size virtual anchor at the centre
// of the viewport gives it a stable, centred home through the same code path.
function viewportCentreAnchor() {
  return {
    getBoundingClientRect: () =>
      new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0),
  };
}

// Guided tour over the batch list. Launched ONLY by `?tour=1` (the welcome screen redirects
// with it, /account links to it) — deliberately not from a DB flag, so the tour depends on no
// server state: revalidatePath from createBatch can't unmount it mid-tour, and the existing
// e2e suite never trips over it.
export function ProductTour({ autoStart }: { autoStart: boolean }) {
  // A snapshot, not a live prop: server re-renders must not restart or kill a running tour.
  const [open, setOpen] = useState(autoStart);
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [isDesktop, setIsDesktop] = useState(true);

  const spotlightRef = useRef<HTMLDivElement | null>(null);

  const t = useTranslations("tour");

  // Current breakpoint. The same step wants a different side against a left sidebar vs a
  // horizontal strip, and rotating a tablet must re-resolve the anchor.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Which steps have a live anchor. Measured after paint — the shell has to be laid out
  // before we can tell which of the two navs is the visible one. Anything unresolved is
  // dropped rather than rendered as a bubble pointing at nothing.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const present = new Set<TourStepId>();
      for (const step of TOUR_STEPS) {
        if (step.selector && visibleElement(step.selector)) present.add(step.id);
      }
      setSteps(resolveTourSteps(present));
    });
    return () => cancelAnimationFrame(frame);
  }, [open, isDesktop]);

  // Drop `?tour=1` as soon as we start: a reload shouldn't replay the tour, and the URL stays
  // clean. replaceState rather than router.replace — the latter would refetch the RSC tree.
  useEffect(() => {
    if (!open) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("tour")) return;
    url.searchParams.delete("tour");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [open]);

  const step = steps[clampStepIndex(index, steps.length)];
  const selector = step?.selector ?? null;

  // Only the spotlight's GEOMETRY is written straight to the DOM: it changes on every
  // scroll/resize frame, and re-rendering the tour that often would be wasteful (and would
  // fight the popover's own positioning). Which of the two overlays exists stays declarative —
  // driving that from here was a bug, because `selector` is already null before the steps
  // resolve, so the effect never re-ran for the anchorless greeting and its veil stayed hidden.
  useEffect(() => {
    if (!open || !selector) return;

    const paint = () => {
      const spotlight = spotlightRef.current;
      const element = visibleElement(selector);
      if (!spotlight || !element) return;

      const rect = element.getBoundingClientRect();
      spotlight.style.top = `${rect.top - SPOTLIGHT_PAD}px`;
      spotlight.style.left = `${rect.left - SPOTLIGHT_PAD}px`;
      spotlight.style.width = `${rect.width + SPOTLIGHT_PAD * 2}px`;
      spotlight.style.height = `${rect.height + SPOTLIGHT_PAD * 2}px`;
      // Follow the target's own rounding (nav items are rounded-xl, the CTA rounded-lg) and
      // grow it by the padding so the hole stays concentric with the highlighted element —
      // otherwise square corners of undimmed page show outside the rounded outline.
      const radius =
        Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
      spotlight.style.borderRadius = `${radius + SPOTLIGHT_PAD}px`;
    };

    const frame = requestAnimationFrame(paint);
    // Capture phase: the sidebar and the page column are separate scroll containers.
    window.addEventListener("scroll", paint, true);
    window.addEventListener("resize", paint);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", paint, true);
      window.removeEventListener("resize", paint);
    };
  }, [open, selector, index]);

  // Bring the target into view before pointing at it.
  useEffect(() => {
    if (!open || !selector) return;
    const element = visibleElement(selector);
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({
      block: "center",
      behavior: reduced ? "auto" : "smooth",
    });
  }, [open, selector, index]);

  const close = useCallback(() => {
    setOpen(false);
    setIndex(0);
  }, []);

  if (!open || steps.length === 0 || !step) return null;

  const isFirst = index <= 0;
  const isLast = index >= steps.length - 1;
  const side = isDesktop ? step.side.desktop : step.side.mobile;

  return (
    <>
      {/* Exactly one of these shows at a time: the plain veil for the anchorless greeting, the
          spotlight for every anchored step. Both pointer-events-none — and there is deliberately
          no Popover.Backdrop. Nothing the tour renders may swallow a tap: that keeps page
          scrolling alive on touch and leaves the composer's press-and-hold drag sensor
          (PRINCIPLES §5) untouched. */}
      {createPortal(
        selector === null ? (
          // Greeting step: nothing to point at, so just dim the screen.
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-40 bg-black/50"
          />
        ) : (
          // The hole IS this element's own box, so the dimming can no longer have square
          // corners the highlight doesn't: an oversized box-shadow spread paints everything
          // around the box, and a box-shadow follows border-radius. The green edge is an
          // `outline` rather than `ring`, because Tailwind's ring is itself a box-shadow and
          // would collide with the spread.
          <div
            ref={spotlightRef}
            aria-hidden
            style={{ boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.5)" }}
            className="pointer-events-none fixed z-40 outline-2 outline-primary motion-safe:transition-[top,left,width,height] motion-safe:duration-300"
          />
        ),
        document.body,
      )}

      <Popover.Root
        open
        // Never modal: that would add Base UI's internal backdrop AND a scroll lock.
        modal={false}
        // Any click outside the bubble ends the tour, on top of Skip/Done and Escape. The
        // user taking over always wins (it's replayable from /account) — and since every
        // server action on this page needs such a click, a revalidatePath can never land
        // while the tour is still open.
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <Popover.Portal>
          <Popover.Positioner
            // Re-resolves the anchor when the step or the breakpoint changes.
            key={`${step.id}-${isDesktop}`}
            anchor={
              selector ? () => visibleElement(selector) : viewportCentreAnchor
            }
            side={side}
            sideOffset={12}
            collisionPadding={12}
            collisionAvoidance={{ side: "flip", align: "shift" }}
            className="z-50"
          >
            <Popover.Popup className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl border bg-popover p-4 text-popover-foreground shadow-xl outline-none">
              <Popover.Title className="font-display text-lg font-bold tracking-wide uppercase">
                {t(`${step.id}Title`)}
              </Popover.Title>
              <Popover.Description className="mt-1 text-sm text-muted-foreground">
                {t(`${step.id}Body`)}
              </Popover.Description>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {t("progress", { current: index + 1, total: steps.length })}
                </span>
                {/* h-11 = 44px tap targets; the default Button is h-8 (PRINCIPLES §5). */}
                <div className="flex items-center gap-2">
                  {!isLast && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={close}
                      className="h-11 px-3"
                    >
                      {t("skip")}
                    </Button>
                  )}
                  {/* Stepping back re-runs the same effects as stepping forward, so the
                      spotlight and the bubble follow along on their own. */}
                  {!isFirst && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIndex((i) => i - 1)}
                      className="h-11 px-3"
                    >
                      {t("previous")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => (isLast ? close() : setIndex((i) => i + 1))}
                    className="h-11 px-4"
                  >
                    {isLast ? t("done") : t("next")}
                  </Button>
                </div>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}

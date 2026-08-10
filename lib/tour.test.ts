import { describe, it, expect } from "vitest";
import {
  TOUR_STEPS,
  resolveTourSteps,
  clampStepIndex,
  type TourStepId,
} from "./tour";

describe("resolveTourSteps", () => {
  it("keeps every step when all anchors are on screen", () => {
    const present = new Set<TourStepId>(["chat", "recipes", "newBatch"]);
    expect(resolveTourSteps(present).map((s) => s.id)).toEqual([
      "welcome",
      "chat",
      "recipes",
      "newBatch",
    ]);
  });

  it("keeps the anchorless greeting even when nothing else resolves", () => {
    expect(resolveTourSteps(new Set()).map((s) => s.id)).toEqual(["welcome"]);
  });

  it("drops a step whose anchor is missing instead of pointing at nothing", () => {
    const present = new Set<TourStepId>(["chat", "newBatch"]);
    expect(resolveTourSteps(present).map((s) => s.id)).toEqual([
      "welcome",
      "chat",
      "newBatch",
    ]);
  });

  it("preserves the declared order, not the caller's set order", () => {
    const present = new Set<TourStepId>(["newBatch", "chat", "recipes"]);
    expect(resolveTourSteps(present).map((s) => s.id)).toEqual(
      TOUR_STEPS.map((s) => s.id),
    );
  });
});

describe("clampStepIndex", () => {
  it("keeps an index that is already in range", () => {
    expect(clampStepIndex(2, 4)).toBe(2);
  });

  it("clamps at both ends", () => {
    expect(clampStepIndex(-3, 4)).toBe(0);
    expect(clampStepIndex(9, 4)).toBe(3);
  });

  it("returns 0 when there is no step at all", () => {
    expect(clampStepIndex(2, 0)).toBe(0);
  });
});

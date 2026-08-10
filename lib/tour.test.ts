import { describe, it, expect } from "vitest";
import {
  TOUR_STEPS,
  resolveTourSteps,
  clampStepIndex,
  cutoutPolygon,
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

describe("cutoutPolygon", () => {
  it("pads the hole around the highlighted rect", () => {
    const polygon = cutoutPolygon(
      { top: 100, right: 300, bottom: 140, left: 200 },
      10,
    );
    // Hole corners: left/top = 190/90, right/bottom = 310/150.
    expect(polygon).toContain("190px 90px");
    expect(polygon).toContain("310px 150px");
  });

  it("hugs the rect exactly with no padding", () => {
    const polygon = cutoutPolygon(
      { top: 10, right: 60, bottom: 40, left: 20 },
      0,
    );
    expect(polygon).toContain("20px 10px");
    expect(polygon).toContain("60px 40px");
  });

  it("covers the whole viewport with the outer ring", () => {
    const polygon = cutoutPolygon({ top: 0, right: 1, bottom: 1, left: 0 });
    expect(polygon.startsWith("polygon(0% 0%,100% 0%,100% 100%,0% 100%")).toBe(
      true,
    );
    expect(polygon.endsWith(")")).toBe(true);
  });

  it("closes the hole path back on its first corner", () => {
    const polygon = cutoutPolygon(
      { top: 100, right: 300, bottom: 140, left: 200 },
      0,
    );
    const corners = polygon.match(/200px 100px/g);
    expect(corners).toHaveLength(2);
  });
});

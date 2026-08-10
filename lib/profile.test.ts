import { describe, it, expect } from "vitest";
import { parseProfileInput } from "./profile";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

describe("parseProfileInput", () => {
  it("reads a first name and a weight", () => {
    expect(parseProfileInput(form({ firstName: "Maxime", weightKg: "78" }))).toEqual({
      firstName: "Maxime",
      weightKg: 78,
      proteinTargetG: null,
    });
  });

  it("trims the first name and treats a blank one as unset", () => {
    expect(parseProfileInput(form({ firstName: "  Maxime  " })).firstName).toBe(
      "Maxime",
    );
    expect(parseProfileInput(form({ firstName: "   " })).firstName).toBeNull();
  });

  it("keeps the custom goal only when the switch is on", () => {
    expect(
      parseProfileInput(form({ proteinTargetG: "180", customTarget: "1" }))
        .proteinTargetG,
    ).toBe(180);
    expect(
      parseProfileInput(form({ proteinTargetG: "180" })).proteinTargetG,
    ).toBeNull();
  });

  it("rounds a decimal custom goal", () => {
    expect(
      parseProfileInput(form({ proteinTargetG: "179.6", customTarget: "1" }))
        .proteinTargetG,
    ).toBe(180);
  });

  it("turns missing, blank and nonsense values into null rather than NaN", () => {
    expect(parseProfileInput(form({}))).toEqual({
      firstName: null,
      weightKg: null,
      proteinTargetG: null,
    });
    expect(parseProfileInput(form({ weightKg: "abc" })).weightKg).toBeNull();
  });

  it("rejects zero and negative weights", () => {
    expect(parseProfileInput(form({ weightKg: "0" })).weightKg).toBeNull();
    expect(parseProfileInput(form({ weightKg: "-70" })).weightKg).toBeNull();
  });
});

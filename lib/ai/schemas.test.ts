import { describe, it, expect } from "vitest";
import { savePreferenceInput } from "./schemas";

// We test the validation guard: what the model proposes must be shaped correctly
// before we ever write it to the DB.
describe("savePreferenceInput", () => {
  it("accepts a valid preference", () => {
    const result = savePreferenceInput.safeParse({
      type: "goût",
      value: "adore le poulet",
      sentiment: "like",
    });
    expect(result.success).toBe(true);
  });

  it("accepts without sentiment (optional)", () => {
    const result = savePreferenceInput.safeParse({
      type: "aversion",
      value: "n'aime pas l'aubergine",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty type", () => {
    const result = savePreferenceInput.safeParse({ type: "", value: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects a sentiment outside the allowed list", () => {
    const result = savePreferenceInput.safeParse({
      type: "goût",
      value: "x",
      sentiment: "adore",
    });
    expect(result.success).toBe(false);
  });
});

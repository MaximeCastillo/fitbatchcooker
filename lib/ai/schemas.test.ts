import { describe, it, expect } from "vitest";
import { savePreferenceInput } from "./schemas";

// We test the validation guard: what the model proposes must be shaped correctly
// before we ever write it to the DB.
describe("savePreferenceInput", () => {
  it("accepte une préférence valide", () => {
    const result = savePreferenceInput.safeParse({
      type: "goût",
      value: "adore le poulet",
      sentiment: "like",
    });
    expect(result.success).toBe(true);
  });

  it("accepte sans sentiment (optionnel)", () => {
    const result = savePreferenceInput.safeParse({
      type: "aversion",
      value: "n'aime pas l'aubergine",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un type vide", () => {
    const result = savePreferenceInput.safeParse({ type: "", value: "x" });
    expect(result.success).toBe(false);
  });

  it("rejette un sentiment hors liste", () => {
    const result = savePreferenceInput.safeParse({
      type: "goût",
      value: "x",
      sentiment: "adore",
    });
    expect(result.success).toBe(false);
  });
});

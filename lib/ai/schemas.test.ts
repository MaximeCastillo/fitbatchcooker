import { describe, it, expect } from "vitest";
import {
  savePreferenceInput,
  searchIngredientsInput,
  createRecipeInput,
} from "./schemas";

const validRecipe = {
  title: "Poulet grillé, riz & brocoli",
  steps: ["Cuire le poulet", "Cuire le riz", "Vapeur le brocoli"],
  mealType: "MAIN" as const,
  ingredients: [
    { name: "Blanc de poulet", quantityG: 150 },
    { name: "Riz", quantityG: 75, proteinPer100g: 7, category: "STARCH" as const },
  ],
};

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

describe("searchIngredientsInput", () => {
  it("accepts a query", () => {
    expect(searchIngredientsInput.safeParse({ query: "poulet" }).success).toBe(
      true,
    );
  });

  it("rejects an empty query", () => {
    expect(searchIngredientsInput.safeParse({ query: "" }).success).toBe(false);
  });
});

describe("createRecipeInput", () => {
  it("accepts a valid recipe (existing + new ingredient)", () => {
    expect(createRecipeInput.safeParse(validRecipe).success).toBe(true);
  });

  it("rejects a recipe with no steps", () => {
    expect(
      createRecipeInput.safeParse({ ...validRecipe, steps: [] }).success,
    ).toBe(false);
  });

  it("rejects a recipe with no ingredients", () => {
    expect(
      createRecipeInput.safeParse({ ...validRecipe, ingredients: [] }).success,
    ).toBe(false);
  });

  it("rejects a non-positive quantity", () => {
    expect(
      createRecipeInput.safeParse({
        ...validRecipe,
        ingredients: [{ name: "Riz", quantityG: 0 }],
      }).success,
    ).toBe(false);
  });

  it("rejects an implausible proteinPer100g (> 100)", () => {
    expect(
      createRecipeInput.safeParse({
        ...validRecipe,
        ingredients: [{ name: "X", quantityG: 100, proteinPer100g: 150 }],
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown mealType", () => {
    expect(
      createRecipeInput.safeParse({ ...validRecipe, mealType: "LUNCH" }).success,
    ).toBe(false);
  });
});

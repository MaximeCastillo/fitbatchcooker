import { describe, it, expect } from "vitest";
import { isTestAccountEmail } from "./test-accounts";

describe("isTestAccountEmail", () => {
  it("recognizes the throwaway accounts the E2E suite creates", () => {
    expect(isTestAccountEmail("e2e+1755261234@example.com")).toBe(true);
    expect(isTestAccountEmail("E2E+1755261234@EXAMPLE.COM")).toBe(true);
  });

  it("spares a real account that merely starts with the prefix", () => {
    expect(isTestAccountEmail("e2e+perso@gmail.com")).toBe(false);
  });

  it("spares accounts on the test domain that lack the prefix", () => {
    expect(isTestAccountEmail("john+e2e@example.com")).toBe(false);
    expect(isTestAccountEmail("john@example.com")).toBe(false);
  });

  it("spares ordinary accounts", () => {
    expect(isTestAccountEmail("maxime@hop3team.com")).toBe(false);
  });
});

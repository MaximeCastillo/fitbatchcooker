import { describe, it, expect } from "vitest";
import {
  deletableAccountIds,
  isOnboarded,
  isTestAccountEmail,
  testAccountIds,
  toAdminAccount,
  type AdminAccount,
} from "./admin";

function account(overrides: Partial<AdminAccount> & { id: string }): AdminAccount {
  return {
    email: `${overrides.id}@example.com`,
    createdAt: new Date("2026-08-01"),
    isOnboarded: true,
    isTestAccount: false,
    ...overrides,
  };
}

describe("isTestAccountEmail", () => {
  it("recognizes the e2e throwaway accounts", () => {
    expect(isTestAccountEmail("e2e+1755261234@example.com")).toBe(true);
    expect(isTestAccountEmail("E2E+1755261234@example.com")).toBe(true);
  });

  it("leaves real accounts alone, including lookalikes", () => {
    expect(isTestAccountEmail("maxime@hop3team.com")).toBe(false);
    expect(isTestAccountEmail("john+e2e@example.com")).toBe(false);
  });
});

describe("isOnboarded", () => {
  it("counts a weight or an explicit protein target as onboarded", () => {
    expect(isOnboarded({ weightKg: 78, proteinTargetG: null })).toBe(true);
    expect(isOnboarded({ weightKg: null, proteinTargetG: 160 })).toBe(true);
  });

  it("treats an account with neither as not onboarded", () => {
    expect(isOnboarded({ weightKg: null, proteinTargetG: null })).toBe(false);
  });
});

describe("toAdminAccount", () => {
  it("derives the onboarded and test flags from the row", () => {
    expect(
      toAdminAccount({
        id: "user-1",
        email: "e2e+42@example.com",
        createdAt: new Date("2026-08-01"),
        weightKg: null,
        proteinTargetG: null,
      }),
    ).toEqual({
      id: "user-1",
      email: "e2e+42@example.com",
      createdAt: new Date("2026-08-01"),
      isOnboarded: false,
      isTestAccount: true,
    });
  });
});

describe("deletableAccountIds", () => {
  const accounts = [
    account({ id: "admin" }),
    account({ id: "alice" }),
    account({ id: "bob" }),
  ];

  it("keeps the requested accounts", () => {
    expect(deletableAccountIds(accounts, ["alice", "bob"], "admin")).toEqual([
      "alice",
      "bob",
    ]);
  });

  it("never lets an admin delete their own account", () => {
    expect(deletableAccountIds(accounts, ["admin", "alice"], "admin")).toEqual([
      "alice",
    ]);
  });

  it("drops ids that match no known account", () => {
    expect(deletableAccountIds(accounts, ["alice", "forged-id"], "admin")).toEqual([
      "alice",
    ]);
  });
});

describe("testAccountIds", () => {
  it("selects the test accounts only", () => {
    const accounts = [
      account({ id: "admin" }),
      account({ id: "alice" }),
      account({ id: "test-1", email: "e2e+1@example.com", isTestAccount: true }),
      account({ id: "test-2", email: "e2e+2@example.com", isTestAccount: true }),
    ];
    expect(testAccountIds(accounts, "admin")).toEqual(["test-1", "test-2"]);
  });

  it("excludes the current admin even if they are a test account", () => {
    const accounts = [
      account({ id: "admin", email: "e2e+admin@example.com", isTestAccount: true }),
      account({ id: "test-1", email: "e2e+1@example.com", isTestAccount: true }),
    ];
    expect(testAccountIds(accounts, "admin")).toEqual(["test-1"]);
  });
});

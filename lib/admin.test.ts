import { describe, it, expect } from "vitest";
import {
  deletableAccountIds,
  isOnboarded,
  toAdminAccount,
  type AdminAccount,
} from "./admin";

function account(overrides: Partial<AdminAccount> & { id: string }): AdminAccount {
  return {
    email: `${overrides.id}@example.com`,
    createdAt: new Date("2026-08-01"),
    isOnboarded: true,
    ...overrides,
  };
}

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
  it("derives the onboarded flag from the row", () => {
    expect(
      toAdminAccount({
        id: "user-1",
        email: "amelie@example.com",
        createdAt: new Date("2026-08-01"),
        weightKg: null,
        proteinTargetG: null,
      }),
    ).toEqual({
      id: "user-1",
      email: "amelie@example.com",
      createdAt: new Date("2026-08-01"),
      isOnboarded: false,
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

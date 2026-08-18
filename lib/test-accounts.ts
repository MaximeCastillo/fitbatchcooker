// What counts as a throwaway E2E account. Single source of truth for the suite that
// creates them (e2e/helpers.ts) and the teardown that deletes them
// (e2e/purge-test-users.ts) — the teardown wipes matching rows from Supabase Auth with no
// confirmation, so the two must never drift.
//
// Lives in lib/ rather than e2e/ so vitest can unit-test it: vitest excludes **/e2e/**,
// and Playwright would collect an e2e/*.test.ts as one of its own specs.

export const TEST_EMAIL_PREFIX = "e2e+";
export const TEST_EMAIL_DOMAIN = "@example.com";

// Both conditions, deliberately: a real person signing up as `e2e+perso@gmail.com` must
// survive the purge.
export function isTestAccountEmail(email: string): boolean {
  const normalized = email.toLowerCase();
  return (
    normalized.startsWith(TEST_EMAIL_PREFIX) && normalized.endsWith(TEST_EMAIL_DOMAIN)
  );
}

// Account-management rules for the /admin page. Pure functions, no DB import — the
// server action and the client list both go through them, so the "who can be deleted"
// answer can't drift between the checkbox that's greyed out and the guard that runs.

// The shape the page needs to render and reason about one account.
export type AdminAccount = {
  id: string;
  email: string;
  createdAt: Date;
  isOnboarded: boolean;
};

// "Onboarded" = the person got far enough to have a protein target, either explicit or
// derived from a weight (the welcome screen writes one or the other).
export function isOnboarded(user: {
  weightKg: number | null;
  proteinTargetG: number | null;
}): boolean {
  return user.weightKg != null || user.proteinTargetG != null;
}

export function toAdminAccount(user: {
  id: string;
  email: string;
  createdAt: Date;
  weightKg: number | null;
  proteinTargetG: number | null;
}): AdminAccount {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    isOnboarded: isOnboarded(user),
  };
}

// The guard, in one place: an admin may never delete their own account (they'd lose the
// page along with it), and ids that don't match a known account are dropped rather than
// trusted — the request comes from a form, so it's user input.
export function deletableAccountIds(
  accounts: AdminAccount[],
  requestedIds: string[],
  currentUserId: string,
): string[] {
  const requested = new Set(requestedIds);
  return accounts
    .filter((account) => account.id !== currentUserId && requested.has(account.id))
    .map((account) => account.id);
}

// Parsing of the profile fields (first name, weight, protein goal). Shared by the two
// forms that write them — the account page editor and the post-signup welcome screen — so
// the coercion rules can't drift apart. No DB import, so it's cheap to unit-test.

export type ProfileInput = {
  firstName: string | null;
  weightKg: number | null;
  proteinTargetG: number | null;
};

// Blank / non-numeric / non-positive values all become null: "not set yet" is a real
// state here (dailyProteinTargetG falls back on it), and null must never become NaN.
function positiveNumberOrNull(raw: string): number | null {
  const value = Number(raw);
  return raw !== "" && Number.isFinite(value) && value > 0 ? value : null;
}

export function parseProfileInput(formData: FormData): ProfileInput {
  const firstName = String(formData.get("firstName") ?? "").trim() || null;
  const weightKg = positiveNumberOrNull(
    String(formData.get("weightKg") ?? "").trim(),
  );

  // A custom goal is opt-in via the switch; otherwise we clear it so the weight-derived
  // (~2 g/kg) value wins in dailyProteinTargetG.
  const customTarget = String(formData.get("customTarget") ?? "") === "1";
  const target = positiveNumberOrNull(
    String(formData.get("proteinTargetG") ?? "").trim(),
  );
  const proteinTargetG =
    customTarget && target != null ? Math.round(target) : null;

  return { firstName, weightKg, proteinTargetG };
}

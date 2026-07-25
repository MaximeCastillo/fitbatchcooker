"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/app/[locale]/account/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClasses =
  "rounded-lg border border-input bg-background px-3 py-2.5 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40";

// Profile editor (client, so the custom-target switch can toggle the goal field live).
// We ask WEIGHT to reduce friction — the protein goal is derived (~2 g/kg) and shown
// greyed-out; the switch un-greys it to override. "Custom" is implicit: it's on iff a
// proteinTargetG is stored — no extra column.
export function ProfileForm({
  user,
  saved,
}: {
  user: {
    firstName: string | null;
    weightKg: number | null;
    proteinTargetG: number | null;
  };
  saved: boolean;
}) {
  const t = useTranslations("profile");
  const [weight, setWeight] = useState(user.weightKg?.toString() ?? "");
  const [customTarget, setCustomTarget] = useState(user.proteinTargetG != null);
  const [target, setTarget] = useState(user.proteinTargetG?.toString() ?? "");

  const weightNum = Number(weight);
  const autoTarget =
    weight.trim() !== "" && Number.isFinite(weightNum) && weightNum > 0
      ? Math.round(weightNum * 2)
      : null;

  return (
    <form action={updateProfile} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("firstName")}
        <input
          type="text"
          name="firstName"
          defaultValue={user.firstName ?? ""}
          autoComplete="given-name"
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("weight")}
        <input
          type="number"
          name="weightKg"
          min={0}
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className={inputClasses}
        />
        <span className="text-xs font-normal text-muted-foreground">
          {t("weightHint")}
        </span>
      </label>

      {/* Protein goal. By default it's derived from the weight and shown greyed-out
          (read-only). The switch un-greys it so it can be overridden. A disabled input
          isn't submitted, so when the switch is off the server keeps proteinTargetG null
          and the weight-derived value wins. */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">{t("proteinTarget")}</span>
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("customTarget")}</span>
            <button
              type="button"
              role="switch"
              aria-checked={customTarget}
              aria-label={t("customTarget")}
              onClick={() => {
                // Prefill with the weight-derived value the first time it's enabled.
                if (!customTarget && !target && autoTarget != null) {
                  setTarget(String(autoTarget));
                }
                setCustomTarget((v) => !v);
              }}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                customTarget ? "bg-primary" : "bg-input",
              )}
            >
              <span
                className={cn(
                  "inline-block size-5 rounded-full bg-background shadow-sm transition-transform",
                  customTarget ? "translate-x-[22px]" : "translate-x-0.5",
                )}
              />
            </button>
          </label>
        </div>
        <input
          type="number"
          name="proteinTargetG"
          min={0}
          value={customTarget ? target : (autoTarget ?? "")}
          onChange={(e) => setTarget(e.target.value)}
          disabled={!customTarget}
          className={cn(
            inputClasses,
            !customTarget && "cursor-not-allowed text-muted-foreground opacity-60",
          )}
        />
        <span className="text-xs font-normal text-muted-foreground">
          {customTarget ? t("proteinHint") : t("weightHint")}
        </span>
      </div>
      <input type="hidden" name="customTarget" value={customTarget ? "1" : ""} />

      {saved && (
        <p role="status" className="text-sm text-primary">
          {t("saved")}
        </p>
      )}

      <Button type="submit" className="mt-1 h-11 w-full text-base">
        {t("save")}
      </Button>
    </form>
  );
}

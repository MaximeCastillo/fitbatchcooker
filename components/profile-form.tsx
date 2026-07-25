"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/app/[locale]/account/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClasses =
  "rounded-lg border border-input bg-background px-3 py-2.5 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40";

// Profile editor (client, so the custom-target switch can show/hide + preview live).
// We ask WEIGHT to reduce friction — the protein goal is derived (~2 g/kg). The switch
// lets power users override with an explicit target instead. "Custom" is implicit: it's
// on iff a proteinTargetG is stored — no extra column.
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

      {/* Override switch. A hidden field carries its state to the server action. */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{t("customTarget")}</span>
        <button
          type="button"
          role="switch"
          aria-checked={customTarget}
          aria-label={t("customTarget")}
          onClick={() => setCustomTarget((v) => !v)}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            customTarget ? "bg-primary" : "bg-input",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-background transition-transform",
              customTarget ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
      <input type="hidden" name="customTarget" value={customTarget ? "1" : ""} />

      {customTarget ? (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {t("proteinTarget")}
          <input
            type="number"
            name="proteinTargetG"
            min={0}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className={inputClasses}
          />
        </label>
      ) : (
        <p className="text-sm text-muted-foreground">
          {autoTarget != null
            ? t("autoTargetPreview", { grams: autoTarget })
            : t("proteinHint")}
        </p>
      )}

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

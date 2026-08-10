"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { completeOnboarding } from "@/app/[locale]/welcome/actions";
import { ProteinGauge } from "@/components/protein-gauge";
import { Button } from "@/components/ui/button";
import { targetFromWeightInput } from "@/lib/nutrition";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const inputClasses =
  "rounded-lg border border-input bg-background px-3 py-2.5 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40";

// Two questions, no more: a first name (the chef greets with it) and a weight. Client
// component so the signature gauge fills LIVE while the weight is typed — the "aha" moment
// happens during onboarding instead of three screens later. We ask the weight rather than
// the goal because nobody knows their protein target in grams, but everyone knows their
// weight (the goal is derived, ~2 g/kg, same rule as dailyProteinTargetG).
export function WelcomeForm({
  user,
}: {
  user: {
    firstName: string | null;
    weightKg: number | null;
    proteinTargetG: number | null;
  };
}) {
  const t = useTranslations("welcome");
  const tProfile = useTranslations("profile");
  const [weight, setWeight] = useState(user.weightKg?.toString() ?? "");
  const [customTarget, setCustomTarget] = useState(user.proteinTargetG != null);
  const [target, setTarget] = useState(user.proteinTargetG?.toString() ?? "");

  const autoTarget = targetFromWeightInput(weight);
  const shownTarget = customTarget ? targetFromWeightInput(target) : autoTarget;

  return (
    <form action={completeOnboarding} className="flex flex-col gap-6">
      <div className="flex items-center gap-5 rounded-2xl border bg-card p-5">
        {/* Fills as soon as a weight is typed (700ms height transition) and seals green —
            a live demo of what a completed day looks like. */}
        <ProteinGauge
          fill={shownTarget != null ? 100 : 0}
          sealed={shownTarget != null}
          className="h-28 w-18"
        />
        <div className="min-w-0">
          <span className="block text-sm font-medium text-muted-foreground">
            {t("targetLabel")}
          </span>
          {shownTarget != null ? (
            <span className="font-mono text-3xl font-bold text-primary">
              {shownTarget} g
            </span>
          ) : (
            <span className="block text-sm text-muted-foreground">
              {t("targetEmpty")}
            </span>
          )}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {tProfile("firstName")}
        <input
          type="text"
          name="firstName"
          defaultValue={user.firstName ?? ""}
          autoComplete="given-name"
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {tProfile("weight")}
        <input
          type="number"
          name="weightKg"
          min={0}
          step="0.1"
          inputMode="decimal"
          autoFocus
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className={inputClasses}
        />
        {/* The weight is intimate data — say why we ask, right in the field. */}
        <span className="text-xs font-normal text-muted-foreground">
          {tProfile("weightHint")}
        </span>
      </label>

      {/* Escape hatch for people who already know their number. Same contract as the
          profile editor: a disabled input isn't submitted, so the server keeps
          proteinTargetG null and the weight-derived value wins. */}
      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-center gap-2 self-start">
          <input
            type="checkbox"
            checked={customTarget}
            onChange={() => {
              if (!customTarget && !target && autoTarget != null) {
                setTarget(String(autoTarget));
              }
              setCustomTarget((v) => !v);
            }}
            className="size-4 accent-primary"
          />
          <span className="text-sm">{tProfile("customTarget")}</span>
        </label>
        <input
          type="number"
          name="proteinTargetG"
          min={0}
          value={customTarget ? target : (autoTarget ?? "")}
          onChange={(e) => setTarget(e.target.value)}
          disabled={!customTarget}
          aria-label={tProfile("proteinTarget")}
          className={cn(
            inputClasses,
            !customTarget && "cursor-not-allowed text-muted-foreground opacity-60",
          )}
        />
      </div>
      <input type="hidden" name="customTarget" value={customTarget ? "1" : ""} />

      <div className="flex flex-col items-center gap-3">
        <Button type="submit" className="h-11 w-full text-base">
          {t("submit")}
        </Button>
        {/* Skippable by design: a blocked user is a lost user. The empty batch list picks
            up the nudge for whoever lands there without a target. */}
        <Link
          href={{ pathname: "/batch", query: { tour: "1" } }}
          className="grid min-h-11 place-items-center px-3 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("skip")}
        </Link>
      </div>
    </form>
  );
}

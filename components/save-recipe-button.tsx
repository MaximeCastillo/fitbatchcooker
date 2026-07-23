"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type Variant = VariantProps<typeof buttonVariants>["variant"];

// Submit button for the save/unsave/remove forms. useFormStatus reads the pending state
// of the parent <form>, so we show a spinner and DISABLE the button while the Server
// Action runs — this prevents the double-click that was accidentally toggling saves back
// off. Must be rendered INSIDE the <form> (it reads the nearest form's status).
export function SaveRecipeButton({
  label,
  variant = "outline",
}: {
  label: string;
  variant?: Variant;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size="sm"
      className="w-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending && <Loader2 className="animate-spin" aria-hidden />}
      {label}
    </Button>
  );
}

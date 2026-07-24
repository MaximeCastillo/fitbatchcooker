import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// The signature motif: a container that fills with protein and "seals" (green + check)
// once the goal is reached. Purely presentational — `fill` is a 0–100 percentage.
// Gentle cauldron bubbles rise in the liquid for a bit of life (see globals.css).
export function ProteinGauge({
  fill,
  sealed = false,
  className,
}: {
  fill: number;
  sealed?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative shrink-0", className ?? "h-13 w-9")}>
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-[8px] border-2 bg-secondary transition-colors",
          sealed ? "border-primary" : "border-muted-foreground/50",
        )}
      >
        <div
          className="absolute inset-x-0 bottom-0 bg-primary transition-[height] duration-700 ease-out"
          style={{ height: `${fill}%` }}
          aria-hidden
        >
          {fill > 0 && (
            <>
              <span className="cauldron-bubble" style={{ left: "28%" }} />
              <span
                className="cauldron-bubble"
                style={{ left: "62%", animationDelay: "0.9s" }}
              />
            </>
          )}
        </div>
      </div>
      {sealed && (
        <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300">
          <Check className="size-3" aria-hidden />
        </span>
      )}
    </div>
  );
}

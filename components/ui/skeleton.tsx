import { cn } from "@/lib/utils";

// Simple placeholder block with a pulse animation, shown while content loads.
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

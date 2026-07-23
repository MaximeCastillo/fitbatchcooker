import { Skeleton } from "@/components/ui/skeleton";

// Placeholder grid that mirrors the recipe cards layout, shown via loading.tsx while the
// page's server data is being fetched.
export function RecipeGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          <div className="flex h-full flex-col gap-4 rounded-xl border p-6">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-auto h-8 w-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

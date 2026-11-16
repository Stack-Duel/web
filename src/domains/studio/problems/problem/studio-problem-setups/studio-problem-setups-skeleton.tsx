import { Skeleton } from "@/shared/components/ui/skeleton";

export default function StudioProblemSetupsSkeleton() {
  return (
    <div className="flex flex-col" aria-label="Loading setups">
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="flex items-center gap-3 py-4 not-last:border-b"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto size-4 rounded-full" />
        </div>
      ))}
    </div>
  );
}

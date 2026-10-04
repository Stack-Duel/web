import { Skeleton } from "@/shared/components/ui/skeleton";

/** Loading placeholder for the account setup form: shown while its data is still
 *  loading, and while a completed account is being redirected away from it. */
export default function SetupFormSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading setup form">
      <div className="space-y-3">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>

      <Skeleton className="h-9 w-28" />
    </div>
  );
}

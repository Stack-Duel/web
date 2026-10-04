"use client";

import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { useProblemPools } from "../api/get-problem-pools";
import { useAddProblemToPool } from "../api/add-problem-to-pool";
import { useRemoveProblemFromPool } from "../api/remove-problem-from-pool";
import CreateProblemPoolForm from "./create-problem-pool-form";

type AdminProblemPoolsProps = {
  problemId: string;
  poolKeys: string[];
};

export default function AdminProblemPools({
  problemId,
  poolKeys,
}: Readonly<AdminProblemPoolsProps>) {
  const { data: pools, isLoading } = useProblemPools();
  const { mutate: addToPool, isPending: isAdding } = useAddProblemToPool();
  const { mutate: removeFromPool, isPending: isRemoving } =
    useRemoveProblemFromPool();

  const togglePool = (poolKey: string, checked: boolean) => {
    if (checked) {
      addToPool(
        { poolKey, problemId },
        {
          onError: (error) =>
            toast.error(error.message || "Failed to add problem to pool"),
        }
      );
    } else {
      removeFromPool(
        { poolKey, problemId },
        {
          onError: (error) =>
            toast.error(error.message || "Failed to remove problem from pool"),
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading pools...</p>
      ) : !pools || pools.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No problem pools exist yet. Create one below.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {pools.map((pool) => (
            <div key={pool.id} className="flex items-center gap-2">
              <Checkbox
                id={`pool-${pool.id}`}
                checked={poolKeys.includes(pool.key)}
                disabled={isAdding || isRemoving}
                onCheckedChange={(checked) =>
                  togglePool(pool.key, checked === true)
                }
              />
              <Label htmlFor={`pool-${pool.id}`} className="font-normal">
                {pool.name}
              </Label>
              <Badge variant="outline">{pool.problemCount}</Badge>
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-4">
        <CreateProblemPoolForm />
      </div>
    </div>
  );
}

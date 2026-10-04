"use client";

import { useQueries } from "@tanstack/react-query";
import { Check, Circle } from "lucide-react";
import { problemByIdQueryOptions } from "@/domains/problem/api/get-problem-by-id";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type RampProblemHistoryProps = {
  solvedProblemIds: string[];
  currentProblemId: string | null;
  viewingProblemId: string | null;
  onSelectProblem: (problemId: string) => void;
  onReturnToCurrent: () => void;
};

export default function RampProblemHistory({
  solvedProblemIds,
  currentProblemId,
  viewingProblemId,
  onSelectProblem,
  onReturnToCurrent,
}: Readonly<RampProblemHistoryProps>) {
  const solvedProblemQueries = useQueries({
    queries: solvedProblemIds.map((id) => problemByIdQueryOptions({ id })),
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-4">
      {currentProblemId ? (
        <button
          type="button"
          onClick={onReturnToCurrent}
          className={cn(
            "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
            viewingProblemId === null && "border-primary bg-muted"
          )}
        >
          <span className="flex items-center gap-2 font-medium">
            <Circle size={14} className="text-blue-600 dark:text-blue-400" />
            Current problem
          </span>
          <Badge variant="secondary">Live</Badge>
        </button>
      ) : null}

      {solvedProblemIds.length === 0 ? (
        <p className="p-2 text-sm text-muted-foreground">
          No problems solved yet.
        </p>
      ) : (
        solvedProblemIds.map((problemId, index) => {
          const query = solvedProblemQueries[index];
          const isViewing = viewingProblemId === problemId;

          return (
            <button
              key={problemId}
              type="button"
              onClick={() => onSelectProblem(problemId)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                isViewing && "border-primary bg-muted"
              )}
            >
              {query.isLoading || !query.data ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <span className="flex items-center gap-2 font-medium">
                  <Check
                    size={14}
                    className="text-green-600 dark:text-green-400"
                  />
                  {query.data.title}
                </span>
              )}
              <Badge className="bg-green-600 text-white hover:bg-green-600/90">
                Solved
              </Badge>
            </button>
          );
        })
      )}
    </div>
  );
}

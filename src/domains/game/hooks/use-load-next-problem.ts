"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { problemByIdQueryOptions } from "@/domains/problem/api/get-problem-by-id";
import { useInitializeProblem } from "@/domains/problem/hooks/use-problem-actions";
import { useGameSessionStore } from "../state/game-session-store";

/**
 * Loads the next problem into the workspace after the player clicks "Next
 * Problem" following an accepted submission.
 */
export function useLoadNextProblem() {
  const queryClient = useQueryClient();
  const initializeProblem = useInitializeProblem();
  const nextProblemLoading = useGameSessionStore((s) => s.nextProblemLoading);

  return async (nextProblemId: string | null) => {
    if (!nextProblemId) return;

    nextProblemLoading();

    try {
      const nextProblem = await queryClient.fetchQuery(
        problemByIdQueryOptions({ id: nextProblemId })
      );
      initializeProblem(nextProblem);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load next problem";
      toast.error(message);
    }
  };
}

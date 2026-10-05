"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSkipProblem as useSkipProblemMutation } from "../api/skip-problem";
import { gameQueryOptions } from "../api/get-game";
import { gameProblemHistoryQueryOptions } from "../api/get-game-problem-history";
import { useLoadNextProblem } from "./use-load-next-problem";

type SkipProblemArgs = {
  gameId: string;
  problemId: string;
};

/**
 * Skips the participant's current problem: calls the skip endpoint, then
 * immediately loads whatever problem comes back into the workspace (unlike a
 * solved problem, there's no "Next Problem" button to wait on — skipping is
 * already the explicit action). Invalidates the game and problem-history
 * queries so the remaining skip count and history reflect the server.
 */
export function useSkipProblem() {
  const queryClient = useQueryClient();
  const loadNextProblem = useLoadNextProblem();
  const { mutateAsync: skipProblem, isPending } = useSkipProblemMutation();

  const skip = async ({ gameId, problemId }: SkipProblemArgs) => {
    try {
      const result = await skipProblem({ gameId, problemId });

      void queryClient.invalidateQueries({
        queryKey: gameQueryOptions({ gameId }).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: gameProblemHistoryQueryOptions({ gameId }).queryKey,
      });

      await loadNextProblem(result.nextProblemId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to skip problem";
      toast.error(message);
    }
  };

  return { skip, isSkipping: isPending };
}

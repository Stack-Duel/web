"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSubmitGameProblem } from "../api/submit-game-problem";
import { useCompleteProblem } from "../api/complete-problem";
import { gameQueryOptions } from "../api/get-game";
import { gameProblemHistoryQueryOptions } from "../api/get-game-problem-history";
import { waitForTerminalSubmission } from "@/domains/submission/api/wait-for-terminal-submission";
import {
  useWorkspaceStore,
  selectIsSubmittingSubmission,
} from "@/domains/workspace/state/workspace-store";
import { useGameSessionStore } from "../state/game-session-store";
import type { Game } from "../models/game";

type SubmitRampSolutionArgs = {
  game: Game;
  problemId: string;
  problemSetupId: string;
};

/**
 * Orchestrates a ramp-workspace submission: focus the Submission tab -> submit
 * the current code -> wait for the submission to reach a terminal state
 * (SignalR push, 60s timeout fallback) -> if accepted, complete the problem,
 * flip the local "solved" flag so the "Next Problem" button appears
 * immediately, and invalidate the game query so score/next-problem come from
 * the server. Mode-agnostic: used by every mode's ramp workspace (Solo Rush,
 * Duel, FFA), since the submit-and-advance loop is identical per participant
 * regardless of how many other players are in the game.
 */
export function useRampSubmission() {
  const queryClient = useQueryClient();
  const isSubmitting = useWorkspaceStore(selectIsSubmittingSubmission);
  const beginSubmission = useWorkspaceStore((s) => s.beginSubmission);
  const setSubmittingSubmission = useWorkspaceStore(
    (s) => s.setSubmittingSubmission
  );
  const setActiveSubmissionId = useWorkspaceStore(
    (s) => s.setActiveSubmissionId
  );
  const setActiveTab = useWorkspaceStore((s) => s.setActiveTab);
  const problemSolved = useGameSessionStore((s) => s.problemSolved);

  const { mutateAsync: submitGameProblem } = useSubmitGameProblem();
  const { mutateAsync: completeProblem } = useCompleteProblem();

  const submit = async ({
    game,
    problemId,
    problemSetupId,
  }: SubmitRampSolutionArgs) => {
    beginSubmission();

    setActiveTab("root", 3);
    setActiveTab("execution", 1);

    const { code } = useWorkspaceStore.getState();

    try {
      const submissionId = await submitGameProblem({
        gameId: game.gameId,
        problemId,
        body: { problemSetupId, code },
      });

      setActiveSubmissionId(submissionId);
      toast.success("Submission created");

      const submission = await waitForTerminalSubmission(
        queryClient,
        submissionId
      );
      if (submission.status !== "Accepted") {
        return;
      }

      const completion = await completeProblem({
        gameId: game.gameId,
        problemId,
        body: { submissionId },
      });

      problemSolved(completion.nextProblemId);

      // Refetch rather than hand-patching the cache. The server is the
      // source of truth for score/next-problem/final status, and the game
      // query is cheap to re-fetch.
      void queryClient.invalidateQueries({
        queryKey: gameQueryOptions({ gameId: game.gameId }).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: gameProblemHistoryQueryOptions({ gameId: game.gameId })
          .queryKey,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit solution";
      toast.error(message);
    } finally {
      setSubmittingSubmission(false);
    }
  };

  return { submit, isSubmitting };
}

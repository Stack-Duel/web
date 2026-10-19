"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSubmitGameProblem } from "../api/submit-game-problem";
import { gameQueryOptions } from "../api/get-game";
import { gameProblemHistoryQueryOptions } from "../api/get-game-problem-history";
import { waitForTerminalSubmission } from "@/domains/submission/api/wait-for-terminal-submission";
import {
  useWorkspaceStore,
  selectIsSubmittingSubmission,
} from "@/domains/workspace/state/workspace-store";
import { useGameSessionStore } from "../state/game-session-store";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import type { Game, GameParticipant } from "../models/game";

type SubmitRampSolutionArgs = {
  game: Game;
  problemId: string;
  problemSetupId: string;
};

type NextProblemOutcome =
  | { kind: "gameOver" }
  | { kind: "advanced"; problemId: string }
  | { kind: "stillGrading" };

function resolveNextProblemOutcome(
  participant: GameParticipant | undefined,
  submittedProblemId: string
): NextProblemOutcome {
  if (
    !participant ||
    participant.hasFinishedProblems ||
    !participant.currentProblem
  ) {
    return { kind: "gameOver" };
  }

  if (participant.currentProblem.problemId !== submittedProblemId) {
    return {
      kind: "advanced",
      problemId: participant.currentProblem.problemId,
    };
  }

  return { kind: "stillGrading" };
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const STILL_GRADING_POLL_INTERVAL_MS = 700;
const STILL_GRADING_MAX_ATTEMPTS = 6;

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
  const gradingStarted = useGameSessionStore((s) => s.gradingStarted);
  const gradingSettled = useGameSessionStore((s) => s.gradingSettled);
  const user = useUserStore(selectUser);

  const { mutateAsync: submitGameProblem } = useSubmitGameProblem();

  const submit = async ({
    game,
    problemId,
    problemSetupId,
  }: SubmitRampSolutionArgs) => {
    beginSubmission();

    setActiveTab("root", 3);
    setActiveTab("execution", 1);

    gradingStarted(problemId);

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

      let outcome: NextProblemOutcome = { kind: "stillGrading" };
      for (let attempt = 0; attempt < STILL_GRADING_MAX_ATTEMPTS; attempt++) {
        const refreshed = await queryClient.fetchQuery({
          ...gameQueryOptions({ gameId: game.gameId }),
          staleTime: 0,
        });

        const participant = refreshed.participants.find(
          (p) => p.userId === user?.id
        );

        outcome = resolveNextProblemOutcome(participant, problemId);
        if (outcome.kind !== "stillGrading") break;

        await delay(STILL_GRADING_POLL_INTERVAL_MS);
      }

      if (outcome.kind === "gameOver") {
        problemSolved(null);
      } else if (outcome.kind === "advanced") {
        problemSolved(outcome.problemId);
      } else {
        toast.error(
          "Your solution was accepted, but the game hasn't advanced yet. It'll update shortly."
        );
      }

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
      gradingSettled();
    }
  };

  return { submit, isSubmitting };
}

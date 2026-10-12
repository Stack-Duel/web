import { isTerminalSubmissionStatus } from "@/domains/submission/lib/submission-status-style";
import type { Game, GameParticipantCurrentProblem } from "../models/game";

export const findOwnCurrentProblem = (
  game: Game | undefined,
  userId: string | undefined
): GameParticipantCurrentProblem | null => {
  if (!game || !userId) return null;

  return (
    game.participants.find((p) => p.userId === userId)?.currentProblem ?? null
  );
};

export const deriveGradingProblemId = (
  game: Game | undefined,
  userId: string | undefined,
  inMemoryGradingProblemId: string | null
): string | null => {
  if (inMemoryGradingProblemId) return inMemoryGradingProblemId;

  const currentProblem = findOwnCurrentProblem(game, userId);
  const latestSubmission = currentProblem?.latestSubmission;

  if (!currentProblem || !latestSubmission) return null;

  return isTerminalSubmissionStatus(latestSubmission.status)
    ? null
    : currentProblem.problemId;
};

export const isCurrentProblemAccepted = (
  game: Game | undefined,
  userId: string | undefined
): boolean =>
  findOwnCurrentProblem(game, userId)?.latestSubmission?.status === "Accepted";

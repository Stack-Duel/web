"use client";

import { useOwnGameProblemHistory } from "./use-own-game-problem-history";

export function useViewingSubmissionId(
  gameId: string,
  viewingProblemId: string | null
): string | null {
  const ownHistory = useOwnGameProblemHistory(gameId);
  return (
    ownHistory?.solvedProblemSubmissions.find(
      (s) => s.problemId === viewingProblemId
    )?.submissionId ?? null
  );
}

"use client";

import { useMemo } from "react";
import { useOwnGameProblemHistory } from "../../hooks/use-own-game-problem-history";
import RampProblemHistory from "./ramp-problem-history";

const EMPTY_SOLVED_PROBLEM_IDS: string[] = [];

export default function RampHistoryTab({
  gameId,
  currentProblemId,
  viewingProblemId,
  onSelectProblem,
  onReturnToCurrent,
}: Readonly<{
  gameId: string;
  currentProblemId: string | null;
  viewingProblemId: string | null;
  onSelectProblem: (problemId: string) => void;
  onReturnToCurrent: () => void;
}>) {
  const ownHistory = useOwnGameProblemHistory(gameId);
  const solvedProblemIds = useMemo(
    () =>
      ownHistory
        ? [...ownHistory.solvedProblemIds].reverse()
        : EMPTY_SOLVED_PROBLEM_IDS,
    [ownHistory]
  );

  return (
    <RampProblemHistory
      solvedProblemIds={solvedProblemIds}
      currentProblemId={currentProblemId}
      viewingProblemId={viewingProblemId}
      onSelectProblem={onSelectProblem}
      onReturnToCurrent={onReturnToCurrent}
    />
  );
}

"use client";

import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import { useGameProblemHistory } from "../api/get-game-problem-history";
import type { GameProblemHistory } from "../models/game";

export function useOwnGameProblemHistory(
  gameId: string
): GameProblemHistory | undefined {
  const user = useUserStore(selectUser);
  const { data: problemHistories } = useGameProblemHistory({ gameId });
  return problemHistories?.find((h) => h.userId === user?.id);
}

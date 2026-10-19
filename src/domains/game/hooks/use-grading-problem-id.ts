import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import {
  useGameSessionStore,
  selectGradingProblemId,
} from "../state/game-session-store";
import { deriveGradingProblemId } from "../lib/current-problem";
import type { Game } from "../models/game";

/**
 * Returns the problem ID currently out for grading for the current user in
 * this game, combining the in-flight submit flag with the server's own
 * live submission status so the result survives a hard refresh.
 */
export function useGradingProblemId(game: Game | undefined): string | null {
  const user = useUserStore(selectUser);
  const gradingProblemId = useGameSessionStore(selectGradingProblemId);

  return deriveGradingProblemId(game, user?.id, gradingProblemId);
}

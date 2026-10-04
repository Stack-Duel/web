import type { GameStatus } from "./game";

export interface AdminGameParticipantSummary {
  userId: string;
  username: string;
  score: number;
  hasForfeited: boolean;
  hasFinishedProblems: boolean;
}

export interface AdminGameListItem {
  gameId: string;
  gameModeKey: string;
  gameModeName: string;
  status: GameStatus;
  timeLimitInSeconds: number;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  participants: AdminGameParticipantSummary[];
}

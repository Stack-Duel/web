import { GameModeKey } from "./game-mode";
import type { SubmissionStatus } from "@/domains/submission/models/submission-status";

export enum GameStatus {
  Pending = "Pending",
  Running = "Running",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface GameParticipantLatestSubmission {
  submissionId: string;
  status: SubmissionStatus;
  createdAt: string;
}

export interface GameParticipantCurrentProblem {
  problemId: string;
  /** The most recent submission against this problem, for the requesting
   *  user's own participant only (always null for other players). */
  latestSubmission?: GameParticipantLatestSubmission | null;
}

export interface GameParticipant {
  userId: string;
  username: string;
  imageUrl?: string;
  seatNumber: number;
  joinedAt: Date;
  score: number;
  currentProblem?: GameParticipantCurrentProblem | null;
  hasForfeited: boolean;
  hasFinishedProblems: boolean;
  skipsRemaining?: number;
}

export interface SolvedProblemSubmission {
  problemId: string;
  submissionId: string;
}

export interface GameProblemHistory {
  userId: string;
  solvedProblemIds: string[];
  solvedProblemSubmissions: SolvedProblemSubmission[];
}

export interface Game {
  gameId: string;
  gameModeId: string;
  gameModeKey: GameModeKey;
  status: GameStatus;
  timeLimitInSeconds: number;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  participants: GameParticipant[];
  techStacks: string[];
  joinCode: string;
  skipsEnabled?: boolean;
}

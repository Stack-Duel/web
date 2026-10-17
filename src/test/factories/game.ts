import { GameModeKey } from "@/domains/game/models/game-mode";
import { GameStatus } from "@/domains/game/models/game";
import type {
  Game,
  GameParticipant,
  GameParticipantCurrentProblem,
  GameParticipantLatestSubmission,
} from "@/domains/game/models/game";

export function buildParticipant(
  overrides: Partial<GameParticipant> = {}
): GameParticipant {
  return {
    userId: "user-1",
    username: "user-1",
    seatNumber: 0,
    joinedAt: new Date(),
    score: 0,
    hasForfeited: false,
    hasFinishedProblems: false,
    ...overrides,
  };
}

export function buildGame(overrides: Partial<Game> = {}): Game {
  return {
    gameId: "game-1",
    gameModeId: "mode-1",
    gameModeKey: GameModeKey.SoloRush,
    status: GameStatus.Running,
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    participants: [],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
}

export function buildLatestSubmission(
  overrides: Partial<GameParticipantLatestSubmission> = {}
): GameParticipantLatestSubmission {
  return {
    submissionId: "sub-1",
    status: "Queued",
    createdAt: "t1",
    ...overrides,
  };
}

export function buildCurrentProblem(
  overrides: Partial<GameParticipantCurrentProblem> = {}
): GameParticipantCurrentProblem {
  return {
    problemId: "problem-1",
    ...overrides,
  };
}

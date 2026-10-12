import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGradingProblemId } from "./use-grading-problem-id";
import { useUserStore } from "@/domains/user/state/user-store";
import { useGameSessionStore } from "../state/game-session-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { Game, GameParticipant } from "../models/game";

vi.mock("@/env", () => import("@/test/mocks/env"));

function buildParticipant(
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

function buildGame(overrides: Partial<Game> = {}): Game {
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

describe("useGradingProblemId", () => {
  beforeEach(() => {
    resetUserStore();
    useGameSessionStore.getState().reset();
  });

  it("resolves the user from the user store and the current problem from the game", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    const game = buildGame({
      participants: [
        buildParticipant({
          userId: "user-1",
          currentProblem: {
            problemId: "problem-1",
            latestSubmission: {
              submissionId: "sub-1",
              status: "Running",
              createdAt: "t1",
            },
          },
        }),
      ],
    });

    const { result } = renderHook(() => useGradingProblemId(game));

    expect(result.current).toBe("problem-1");
  });

  it("prefers the in-memory grading flag over the derived server state", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    useGameSessionStore.getState().gradingStarted("problem-in-memory");
    const game = buildGame({
      participants: [
        buildParticipant({
          userId: "user-1",
          currentProblem: {
            problemId: "problem-1",
            latestSubmission: {
              submissionId: "sub-1",
              status: "Accepted",
              createdAt: "t1",
            },
          },
        }),
      ],
    });

    const { result } = renderHook(() => useGradingProblemId(game));

    expect(result.current).toBe("problem-in-memory");
  });

  it("returns null when there is no user", () => {
    const game = buildGame({
      participants: [
        buildParticipant({
          userId: "user-1",
          currentProblem: {
            problemId: "problem-1",
            latestSubmission: {
              submissionId: "sub-1",
              status: "Running",
              createdAt: "t1",
            },
          },
        }),
      ],
    });

    const { result } = renderHook(() => useGradingProblemId(game));

    expect(result.current).toBeNull();
  });
});

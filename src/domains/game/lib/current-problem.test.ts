import { describe, expect, it } from "vitest";
import {
  deriveGradingProblemId,
  findOwnCurrentProblem,
  isCurrentProblemAccepted,
} from "./current-problem";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { Game, GameParticipant } from "../models/game";

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

describe("findOwnCurrentProblem", () => {
  it("returns null when the game is undefined", () => {
    expect(findOwnCurrentProblem(undefined, "user-1")).toBeNull();
  });

  it("returns null when the user id is undefined", () => {
    const game = buildGame({
      participants: [
        buildParticipant({ currentProblem: { problemId: "problem-1" } }),
      ],
    });

    expect(findOwnCurrentProblem(game, undefined)).toBeNull();
  });

  it("returns null when the user is not a participant", () => {
    const game = buildGame({
      participants: [
        buildParticipant({
          userId: "user-1",
          currentProblem: { problemId: "problem-1" },
        }),
      ],
    });

    expect(findOwnCurrentProblem(game, "user-2")).toBeNull();
  });

  it("returns the participant's current problem", () => {
    const currentProblem = { problemId: "problem-1" };
    const game = buildGame({
      participants: [
        buildParticipant({ userId: "user-1", currentProblem }),
      ],
    });

    expect(findOwnCurrentProblem(game, "user-1")).toBe(currentProblem);
  });
});

describe("deriveGradingProblemId", () => {
  it("returns the in-memory id when set, ignoring the server state", () => {
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

    expect(deriveGradingProblemId(game, "user-1", "problem-9")).toBe(
      "problem-9"
    );
  });

  it("returns the current problem id when the latest submission is Queued", () => {
    const game = buildGame({
      participants: [
        buildParticipant({
          userId: "user-1",
          currentProblem: {
            problemId: "problem-1",
            latestSubmission: {
              submissionId: "sub-1",
              status: "Queued",
              createdAt: "t1",
            },
          },
        }),
      ],
    });

    expect(deriveGradingProblemId(game, "user-1", null)).toBe("problem-1");
  });

  it("returns the current problem id when the latest submission is Running", () => {
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

    expect(deriveGradingProblemId(game, "user-1", null)).toBe("problem-1");
  });

  it("returns null when the latest submission is Accepted", () => {
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

    expect(deriveGradingProblemId(game, "user-1", null)).toBeNull();
  });

  it("returns null when the latest submission is WrongAnswer", () => {
    const game = buildGame({
      participants: [
        buildParticipant({
          userId: "user-1",
          currentProblem: {
            problemId: "problem-1",
            latestSubmission: {
              submissionId: "sub-1",
              status: "WrongAnswer",
              createdAt: "t1",
            },
          },
        }),
      ],
    });

    expect(deriveGradingProblemId(game, "user-1", null)).toBeNull();
  });

  it("returns null when there is no latest submission", () => {
    const game = buildGame({
      participants: [
        buildParticipant({
          userId: "user-1",
          currentProblem: { problemId: "problem-1" },
        }),
      ],
    });

    expect(deriveGradingProblemId(game, "user-1", null)).toBeNull();
  });
});

describe("isCurrentProblemAccepted", () => {
  it("is true for an Accepted latest submission on the current problem", () => {
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

    expect(isCurrentProblemAccepted(game, "user-1")).toBe(true);
  });

  it("is false when the latest submission is not Accepted", () => {
    const game = buildGame({
      participants: [
        buildParticipant({
          userId: "user-1",
          currentProblem: {
            problemId: "problem-1",
            latestSubmission: {
              submissionId: "sub-1",
              status: "WrongAnswer",
              createdAt: "t1",
            },
          },
        }),
      ],
    });

    expect(isCurrentProblemAccepted(game, "user-1")).toBe(false);
  });

  it("is false when there is no current problem", () => {
    expect(isCurrentProblemAccepted(buildGame(), "user-1")).toBe(false);
  });
});

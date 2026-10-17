import { describe, expect, it } from "vitest";
import {
  deriveGradingProblemId,
  findOwnCurrentProblem,
  isCurrentProblemAccepted,
} from "./current-problem";
import {
  buildCurrentProblem,
  buildGame,
  buildLatestSubmission,
  buildParticipant,
} from "@/test/factories/game";
import type { Game } from "@/domains/game/models/game";
import type { SubmissionStatus } from "@/domains/submission/models/submission-status";

function gameWithOwnLatestSubmission(status?: SubmissionStatus): Game {
  return buildGame({
    participants: [
      buildParticipant({
        userId: "user-1",
        currentProblem: buildCurrentProblem({
          latestSubmission: status ? buildLatestSubmission({ status }) : null,
        }),
      }),
    ],
  });
}

describe("findOwnCurrentProblem", () => {
  it("returns null when the game is undefined", () => {
    expect(findOwnCurrentProblem(undefined, "user-1")).toBeNull();
  });

  it("returns null when the user id is undefined", () => {
    const game = buildGame({
      participants: [
        buildParticipant({ currentProblem: buildCurrentProblem() }),
      ],
    });

    expect(findOwnCurrentProblem(game, undefined)).toBeNull();
  });

  it("returns null when the user is not a participant", () => {
    const game = gameWithOwnLatestSubmission();

    expect(findOwnCurrentProblem(game, "user-2")).toBeNull();
  });

  it("returns the participant's current problem", () => {
    const currentProblem = buildCurrentProblem();
    const game = buildGame({
      participants: [buildParticipant({ userId: "user-1", currentProblem })],
    });

    expect(findOwnCurrentProblem(game, "user-1")).toBe(currentProblem);
  });
});

describe("deriveGradingProblemId", () => {
  it("returns the in-memory id when set, ignoring the server state", () => {
    const game = gameWithOwnLatestSubmission("Accepted");

    expect(deriveGradingProblemId(game, "user-1", "problem-9")).toBe(
      "problem-9"
    );
  });

  it.each([
    ["Queued", "problem-1"],
    ["Running", "problem-1"],
    ["Accepted", null],
    ["WrongAnswer", null],
  ] as const)("latest submission %s derives %s", (status, expected) => {
    const game = gameWithOwnLatestSubmission(status);

    expect(deriveGradingProblemId(game, "user-1", null)).toBe(expected);
  });

  it("returns null when there is no latest submission", () => {
    const game = gameWithOwnLatestSubmission();

    expect(deriveGradingProblemId(game, "user-1", null)).toBeNull();
  });
});

describe("isCurrentProblemAccepted", () => {
  it.each([
    ["Accepted", true],
    ["WrongAnswer", false],
  ] as const)("latest submission %s is accepted: %s", (status, expected) => {
    const game = gameWithOwnLatestSubmission(status);

    expect(isCurrentProblemAccepted(game, "user-1")).toBe(expected);
  });

  it("is false when there is no current problem", () => {
    expect(isCurrentProblemAccepted(buildGame(), "user-1")).toBe(false);
  });
});

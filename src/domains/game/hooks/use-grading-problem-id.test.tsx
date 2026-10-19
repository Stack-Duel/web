import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGradingProblemId } from "./use-grading-problem-id";
import { useUserStore } from "@/domains/user/state/user-store";
import { useGameSessionStore } from "../state/game-session-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import {
  buildCurrentProblem,
  buildGame,
  buildLatestSubmission,
  buildParticipant,
} from "@/test/factories/game";
import type { Game } from "../models/game";
import type { SubmissionStatus } from "@/domains/submission/models/submission-status";

vi.mock("@/env", () => import("@/test/mocks/env"));

function gameWithOwnLatestSubmission(status: SubmissionStatus): Game {
  return buildGame({
    participants: [
      buildParticipant({
        userId: "user-1",
        currentProblem: buildCurrentProblem({
          latestSubmission: buildLatestSubmission({ status }),
        }),
      }),
    ],
  });
}

describe("useGradingProblemId", () => {
  beforeEach(() => {
    resetUserStore();
    useGameSessionStore.getState().reset();
  });

  it("resolves the user from the user store and the current problem from the game", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    const { result } = renderHook(() =>
      useGradingProblemId(gameWithOwnLatestSubmission("Running"))
    );

    expect(result.current).toBe("problem-1");
  });

  it("prefers the in-memory grading flag over the derived server state", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    useGameSessionStore.getState().gradingStarted("problem-in-memory");

    const { result } = renderHook(() =>
      useGradingProblemId(gameWithOwnLatestSubmission("Accepted"))
    );

    expect(result.current).toBe("problem-in-memory");
  });

  it("returns null when there is no user", () => {
    const { result } = renderHook(() =>
      useGradingProblemId(gameWithOwnLatestSubmission("Running"))
    );

    expect(result.current).toBeNull();
  });
});

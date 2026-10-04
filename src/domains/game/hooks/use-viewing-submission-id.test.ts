import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useViewingSubmissionId } from "./use-viewing-submission-id";
import { useOwnGameProblemHistory } from "./use-own-game-problem-history";
import type { GameProblemHistory } from "../models/game";

vi.mock("./use-own-game-problem-history", () => ({
  useOwnGameProblemHistory: vi.fn(),
}));

const mockedUseOwnGameProblemHistory = vi.mocked(useOwnGameProblemHistory);

describe("useViewingSubmissionId", () => {
  it("returns null when there is no own history", () => {
    mockedUseOwnGameProblemHistory.mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useViewingSubmissionId("game-1", "problem-1")
    );

    expect(result.current).toBeNull();
  });

  it("returns null when the viewed problem was never solved", () => {
    const history: GameProblemHistory = {
      userId: "user-1",
      solvedProblemIds: ["problem-2"],
      solvedProblemSubmissions: [
        { problemId: "problem-2", submissionId: "sub-2" },
      ],
    };
    mockedUseOwnGameProblemHistory.mockReturnValue(history);

    const { result } = renderHook(() =>
      useViewingSubmissionId("game-1", "problem-1")
    );

    expect(result.current).toBeNull();
  });

  it("returns the submission ID behind the viewed problem", () => {
    const history: GameProblemHistory = {
      userId: "user-1",
      solvedProblemIds: ["problem-1"],
      solvedProblemSubmissions: [
        { problemId: "problem-1", submissionId: "sub-1" },
      ],
    };
    mockedUseOwnGameProblemHistory.mockReturnValue(history);

    const { result } = renderHook(() =>
      useViewingSubmissionId("game-1", "problem-1")
    );

    expect(result.current).toBe("sub-1");
  });
});

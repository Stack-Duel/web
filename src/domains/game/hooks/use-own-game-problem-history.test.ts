import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOwnGameProblemHistory } from "./use-own-game-problem-history";
import { useGameProblemHistory } from "../api/get-game-problem-history";
import { useUserStore } from "@/domains/user/state/user-store";
import { buildUser } from "@/test/factories/user";
import type { GameProblemHistory } from "../models/game";

vi.mock("../api/get-game-problem-history", () => ({
  useGameProblemHistory: vi.fn(),
}));

const mockedUseGameProblemHistory = vi.mocked(useGameProblemHistory);

describe("useOwnGameProblemHistory", () => {
  beforeEach(() => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
  });

  it("returns undefined when there is no history data", () => {
    mockedUseGameProblemHistory.mockReturnValue({ data: undefined } as never);

    const { result } = renderHook(() => useOwnGameProblemHistory("game-1"));

    expect(result.current).toBeUndefined();
  });

  it("returns undefined when the current user has no row in the history", () => {
    const histories: GameProblemHistory[] = [
      {
        userId: "someone-else",
        solvedProblemIds: [],
        solvedProblemSubmissions: [],
      },
    ];
    mockedUseGameProblemHistory.mockReturnValue({ data: histories } as never);

    const { result } = renderHook(() => useOwnGameProblemHistory("game-1"));

    expect(result.current).toBeUndefined();
  });

  it("returns the current user's own row when present", () => {
    const ownHistory: GameProblemHistory = {
      userId: "user-1",
      solvedProblemIds: ["problem-1"],
      solvedProblemSubmissions: [],
    };
    const histories: GameProblemHistory[] = [
      {
        userId: "someone-else",
        solvedProblemIds: [],
        solvedProblemSubmissions: [],
      },
      ownHistory,
    ];
    mockedUseGameProblemHistory.mockReturnValue({ data: histories } as never);

    const { result } = renderHook(() => useOwnGameProblemHistory("game-1"));

    expect(result.current).toEqual(ownHistory);
  });
});

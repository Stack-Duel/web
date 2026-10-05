import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useGameCountdown } from "./use-game-countdown";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { Game } from "../models/game";

function buildGame(overrides: Partial<Game> = {}): Game {
  return {
    gameId: "game-1",
    gameModeId: "mode-1",
    gameModeKey: GameModeKey.Duel,
    status: GameStatus.Running,
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    participants: [],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
}

describe("useGameCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is not counting down when there is no game yet", () => {
    const { result } = renderHook(() => useGameCountdown(undefined));

    expect(result.current.isCountingDown).toBe(false);
  });

  it("is not counting down while Pending", () => {
    const game = buildGame({
      status: GameStatus.Pending,
      startedAt: undefined,
    });
    const { result } = renderHook(() => useGameCountdown(game));

    expect(result.current.isCountingDown).toBe(false);
  });

  it("is not counting down once startedAt has already passed", () => {
    const game = buildGame({ startedAt: new Date(Date.now() - 1_000) });
    const { result } = renderHook(() => useGameCountdown(game));

    expect(result.current.isCountingDown).toBe(false);
  });

  it("counts down to a future startedAt and stops once it arrives", () => {
    const game = buildGame({ startedAt: new Date(Date.now() + 3_000) });
    const { result } = renderHook(() => useGameCountdown(game));

    expect(result.current.isCountingDown).toBe(true);
    expect(result.current.secondsRemaining).toBe(3);

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    expect(result.current.isCountingDown).toBe(false);
    expect(result.current.secondsRemaining).toBe(0);
  });
});

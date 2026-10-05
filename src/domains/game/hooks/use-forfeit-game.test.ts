import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useForfeitGame } from "./use-forfeit-game";
import { useForfeitGame as useForfeitGameMutation } from "../api/forfeit-game";

vi.mock("../api/forfeit-game", () => ({ useForfeitGame: vi.fn() }));

const mockedMutation = vi.mocked(useForfeitGameMutation);

describe("useForfeitGame", () => {
  it("does nothing when there is no gameId", () => {
    const mutate = vi.fn();
    mockedMutation.mockReturnValue({ mutate, isPending: false } as never);

    const { result } = renderHook(() => useForfeitGame(undefined));
    result.current.forfeit();

    expect(mutate).not.toHaveBeenCalled();
  });

  it("forfeits the given game", () => {
    const mutate = vi.fn();
    mockedMutation.mockReturnValue({ mutate, isPending: false } as never);

    const { result } = renderHook(() => useForfeitGame("game-1"));
    result.current.forfeit();

    expect(mutate).toHaveBeenCalledWith({ gameId: "game-1" });
  });

  it("exposes the mutation's pending state", () => {
    mockedMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as never);

    const { result } = renderHook(() => useForfeitGame("game-1"));

    expect(result.current.isForfeiting).toBe(true);
  });
});

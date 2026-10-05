import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { useCreateGameAndPlay } from "./use-create-game-and-play";
import { useCreateGame } from "../api/create-game";
import { GameModeKey } from "../models/game-mode";
import { routerConfig } from "@/shared/router-config";

vi.mock("../api/create-game", () => ({ useCreateGame: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockedUseCreateGame = vi.mocked(useCreateGame);

describe("useCreateGameAndPlay", () => {
  it("navigates to the created game on success", () => {
    const mutate = vi.fn(
      (_args, options?: { onSuccess?: (gameId: string) => void }) => {
        options?.onSuccess?.("game-42");
      }
    );
    mockedUseCreateGame.mockReturnValue({
      mutate,
      isPending: false,
    } as never);

    const { result } = renderHook(() => useCreateGameAndPlay());
    result.current.createGame({
      gameModeKey: GameModeKey.Duel,
      timeLimitInSeconds: 600,
      trackSelections: [
        { trackKey: "general-purpose", languageIds: ["lang-js"] },
      ],
    });

    expect(mutate).toHaveBeenCalledWith(
      {
        gameModeKey: GameModeKey.Duel,
        timeLimitInSeconds: 600,
        trackSelections: [
          { trackKey: "general-purpose", languageIds: ["lang-js"] },
        ],
      },
      expect.anything()
    );
  });

  it("routes to the new game's play page", async () => {
    const { routerMock } = await import("@/test/mocks/next-navigation");
    const mutate = vi.fn(
      (_args, options?: { onSuccess?: (gameId: string) => void }) => {
        options?.onSuccess?.("game-42");
      }
    );
    mockedUseCreateGame.mockReturnValue({
      mutate,
      isPending: false,
    } as never);

    const { result } = renderHook(() => useCreateGameAndPlay());
    result.current.createGame({
      gameModeKey: GameModeKey.Duel,
      timeLimitInSeconds: 600,
      trackSelections: [
        { trackKey: "general-purpose", languageIds: ["lang-js"] },
      ],
    });

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.gamePlay.execute({ gameId: "game-42" })
    );
  });

  it("toasts an error message when creation fails", () => {
    const mutate = vi.fn(
      (_args, options?: { onError?: (error: Error) => void }) => {
        options?.onError?.(new Error("boom"));
      }
    );
    mockedUseCreateGame.mockReturnValue({
      mutate,
      isPending: false,
    } as never);

    const { result } = renderHook(() => useCreateGameAndPlay());
    result.current.createGame({
      gameModeKey: GameModeKey.Ffa,
      timeLimitInSeconds: 300,
      trackSelections: [
        { trackKey: "general-purpose", languageIds: ["lang-js"] },
      ],
    });

    expect(toast.error).toHaveBeenCalledWith("boom");
  });

  it("exposes the mutation's pending state", () => {
    mockedUseCreateGame.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as never);

    const { result } = renderHook(() => useCreateGameAndPlay());

    expect(result.current.isCreating).toBe(true);
  });
});

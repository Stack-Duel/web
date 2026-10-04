import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLobbyListRealtimeSync } from "./use-lobby-list-realtime-sync";
import {
  joinGameUpdates,
  leaveGameUpdates,
  onGameLobbyUpdatedPush,
} from "@/shared/lib/signalr/game-hub-client";

vi.mock("@/shared/lib/signalr/game-hub-client", () => ({
  joinGameUpdates: vi.fn().mockResolvedValue(undefined),
  leaveGameUpdates: vi.fn().mockResolvedValue(undefined),
  onGameLobbyUpdatedPush: vi.fn(() => () => {}),
}));

const mockedJoinGameUpdates = vi.mocked(joinGameUpdates);
const mockedLeaveGameUpdates = vi.mocked(leaveGameUpdates);
const mockedOnGameLobbyUpdatedPush = vi.mocked(onGameLobbyUpdatedPush);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return { Wrapper, invalidateQueries };
}

describe("useLobbyListRealtimeSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedJoinGameUpdates.mockResolvedValue(undefined);
    mockedLeaveGameUpdates.mockResolvedValue(undefined);
    mockedOnGameLobbyUpdatedPush.mockImplementation(() => () => {});
  });

  it("joins the SignalR group for each given game id", async () => {
    const { Wrapper } = createWrapper();

    renderHook(() => useLobbyListRealtimeSync(["game-1", "game-2"]), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(mockedJoinGameUpdates).toHaveBeenCalledWith("game-1");
      expect(mockedJoinGameUpdates).toHaveBeenCalledWith("game-2");
    });
  });

  it("leaves a game's group once it drops out of the id list", async () => {
    const { Wrapper } = createWrapper();

    const { rerender } = renderHook(
      ({ ids }: { ids: string[] }) => useLobbyListRealtimeSync(ids),
      { wrapper: Wrapper, initialProps: { ids: ["game-1"] } }
    );

    await waitFor(() =>
      expect(mockedJoinGameUpdates).toHaveBeenCalledWith("game-1")
    );

    rerender({ ids: [] });

    await waitFor(() =>
      expect(mockedLeaveGameUpdates).toHaveBeenCalledWith("game-1")
    );
  });

  it("invalidates my-active-games and open-games on a push for a joined game", async () => {
    let pushHandler: (payload: { gameId: string }) => void = () => {};
    mockedOnGameLobbyUpdatedPush.mockImplementation((handler) => {
      pushHandler = handler;
      return () => {};
    });
    const { Wrapper, invalidateQueries } = createWrapper();

    renderHook(() => useLobbyListRealtimeSync(["game-1"]), {
      wrapper: Wrapper,
    });

    await waitFor(() =>
      expect(mockedJoinGameUpdates).toHaveBeenCalledWith("game-1")
    );

    pushHandler({ gameId: "game-1" });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["my-active-games"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["open-games"],
    });
  });

  it("ignores a push for a game it hasn't joined", async () => {
    let pushHandler: (payload: { gameId: string }) => void = () => {};
    mockedOnGameLobbyUpdatedPush.mockImplementation((handler) => {
      pushHandler = handler;
      return () => {};
    });
    const { Wrapper, invalidateQueries } = createWrapper();

    renderHook(() => useLobbyListRealtimeSync(["game-1"]), {
      wrapper: Wrapper,
    });

    await waitFor(() =>
      expect(mockedJoinGameUpdates).toHaveBeenCalledWith("game-1")
    );

    pushHandler({ gameId: "some-other-game" });

    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});

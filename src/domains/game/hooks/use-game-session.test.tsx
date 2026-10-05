import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGameSession } from "./use-game-session";
import { useStartGame } from "../api/start-game";
import { useGame } from "../api/get-game";
import { useGameSessionStore } from "../state/game-session-store";
import { useUserStore } from "@/domains/user/state/user-store";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import {
  joinGameUpdates,
  leaveGameUpdates,
  onGameParticipantAttemptedPush,
  onGameParticipantReactedPush,
} from "@/shared/lib/signalr/game-hub-client";
import { buildUser } from "@/test/factories/user";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { Game } from "../models/game";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("../api/start-game", () => ({ useStartGame: vi.fn() }));
vi.mock("../api/get-game", async () => {
  const actual =
    await vi.importActual<typeof import("../api/get-game")>("../api/get-game");
  return { ...actual, useGame: vi.fn() };
});
vi.mock("@/domains/problem/hooks/use-problem-actions", () => ({
  useInitializeProblem: () => initializeProblem,
  useClearProblem: () => clearProblem,
}));
vi.mock("@/domains/problem/api/get-problem-by-id", () => ({
  problemByIdQueryOptions: (params: { id: string }) => ({
    queryKey: ["problem-by-id", params.id],
    queryFn: async () => ({ id: params.id, title: "Problem" }),
  }),
}));
vi.mock("@/shared/lib/signalr/game-hub-client", () => ({
  joinGameUpdates: vi.fn().mockResolvedValue(undefined),
  leaveGameUpdates: vi.fn().mockResolvedValue(undefined),
  onGameCompletedPush: vi.fn(() => () => {}),
  onGameLobbyUpdatedPush: vi.fn(() => () => {}),
  onGameProgressUpdatedPush: vi.fn(() => () => {}),
  onGameParticipantAttemptedPush: vi.fn(() => () => {}),
  onGameParticipantReactedPush: vi.fn(() => () => {}),
}));

const initializeProblem = vi.fn();
const clearProblem = vi.fn();
const mockedUseStartGame = vi.mocked(useStartGame);
const mockedUseGame = vi.mocked(useGame);
const mockedOnGameParticipantAttemptedPush = vi.mocked(
  onGameParticipantAttemptedPush
);
const mockedOnGameParticipantReactedPush = vi.mocked(
  onGameParticipantReactedPush
);

function buildGame(overrides: Partial<Game> = {}): Game {
  return {
    gameId: "game-1",
    gameModeId: "mode-1",
    gameModeKey: GameModeKey.SoloRush,
    status: GameStatus.Pending,
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    participants: [],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe("useGameSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameSessionStore.getState().reset();
    useWorkspaceStore.getState().reset();
    useUserStore.setState({ user: null, authProfile: null });
    mockedUseStartGame.mockReturnValue({ mutateAsync: vi.fn() } as never);
    mockedUseGame.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as never);
  });

  it("clears leftover problem/workspace/session state on mount", () => {
    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    expect(clearProblem).toHaveBeenCalled();
  });

  it("auto-starts a Pending Solo Rush game once", async () => {
    const startGame = vi.fn().mockResolvedValue(undefined);
    mockedUseStartGame.mockReturnValue({ mutateAsync: startGame } as never);
    mockedUseGame.mockReturnValue({
      data: buildGame({ status: GameStatus.Pending }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    await waitFor(() =>
      expect(startGame).toHaveBeenCalledWith(
        { gameId: "game-1" },
        expect.anything()
      )
    );
    expect(startGame).toHaveBeenCalledTimes(1);
  });

  it("does not auto-start a Pending Duel game", async () => {
    const startGame = vi.fn();
    mockedUseStartGame.mockReturnValue({ mutateAsync: startGame } as never);
    mockedUseGame.mockReturnValue({
      data: buildGame({
        status: GameStatus.Pending,
        gameModeKey: GameModeKey.Duel,
      }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    expect(startGame).not.toHaveBeenCalled();
  });

  it("does not auto-start an already Running game", () => {
    const startGame = vi.fn();
    mockedUseStartGame.mockReturnValue({ mutateAsync: startGame } as never);
    mockedUseGame.mockReturnValue({
      data: buildGame({ status: GameStatus.Running }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    expect(startGame).not.toHaveBeenCalled();
  });

  it("joins SignalR game updates while the game is Pending or Running", async () => {
    mockedUseGame.mockReturnValue({
      data: buildGame({ status: GameStatus.Running }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(joinGameUpdates).toHaveBeenCalledWith("game-1"));
  });

  it("leaves SignalR game updates on unmount", async () => {
    mockedUseGame.mockReturnValue({
      data: buildGame({ status: GameStatus.Running }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    const { unmount } = renderHook(() => useGameSession("game-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(joinGameUpdates).toHaveBeenCalled());

    unmount();

    await waitFor(() =>
      expect(leaveGameUpdates).toHaveBeenCalledWith("game-1")
    );
  });

  it("adds a feed entry when a participant-attempted push arrives", async () => {
    mockedUseGame.mockReturnValue({
      data: buildGame({ status: GameStatus.Running }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    await waitFor(() =>
      expect(mockedOnGameParticipantAttemptedPush).toHaveBeenCalled()
    );
    const handler = mockedOnGameParticipantAttemptedPush.mock.calls[0][0];
    handler({
      gameId: "game-1",
      userId: "user-2",
      status: "WrongAnswer",
      attemptedAt: "2026-01-01T00:00:00.000Z",
    });

    expect(useGameSessionStore.getState().feed).toMatchObject([
      { type: "attempt", userId: "user-2", status: "WrongAnswer" },
    ]);
  });

  it("adds a feed entry when a participant-reacted push arrives", async () => {
    mockedUseGame.mockReturnValue({
      data: buildGame({ status: GameStatus.Running }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    await waitFor(() =>
      expect(mockedOnGameParticipantReactedPush).toHaveBeenCalled()
    );
    const handler = mockedOnGameParticipantReactedPush.mock.calls[0][0];
    handler({
      gameId: "game-1",
      userId: "user-2",
      emoji: "🔥",
      sentAt: "2026-01-01T00:00:00.000Z",
    });

    expect(useGameSessionStore.getState().feed).toMatchObject([
      { type: "reaction", userId: "user-2", emoji: "🔥" },
    ]);
  });

  it("ignores pushes for a different game", async () => {
    mockedUseGame.mockReturnValue({
      data: buildGame({ status: GameStatus.Running }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    await waitFor(() =>
      expect(mockedOnGameParticipantAttemptedPush).toHaveBeenCalled()
    );
    const handler = mockedOnGameParticipantAttemptedPush.mock.calls[0][0];
    handler({
      gameId: "some-other-game",
      userId: "user-2",
      status: "Accepted",
      attemptedAt: "2026-01-01T00:00:00.000Z",
    });

    expect(useGameSessionStore.getState().feed).toEqual([]);
  });

  it("does not subscribe to SignalR updates when the game is Completed", () => {
    mockedUseGame.mockReturnValue({
      data: buildGame({ status: GameStatus.Completed }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    expect(joinGameUpdates).not.toHaveBeenCalled();
  });

  it("loads the current user's active problem once the game and user are available", async () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    mockedUseGame.mockReturnValue({
      data: buildGame({
        status: GameStatus.Running,
        participants: [
          {
            userId: "user-1",
            username: "tester",
            seatNumber: 0,
            joinedAt: new Date(),
            score: 0,
            currentProblem: { problemId: "problem-1" },
            hasForfeited: false,
            hasFinishedProblems: false,
          },
        ],
      }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(initializeProblem).toHaveBeenCalled());
  });

  it("does not load a problem while a next-problem transition is pending", () => {
    useGameSessionStore.getState().problemSolved("problem-2");
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    mockedUseGame.mockReturnValue({
      data: buildGame({
        status: GameStatus.Running,
        participants: [
          {
            userId: "user-1",
            username: "tester",
            seatNumber: 0,
            joinedAt: new Date(),
            score: 0,
            currentProblem: { problemId: "problem-1" },
            hasForfeited: false,
            hasFinishedProblems: false,
          },
        ],
      }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderHook(() => useGameSession("game-1"), { wrapper: createWrapper() });

    expect(initializeProblem).not.toHaveBeenCalled();
  });

  it("exposes the game, loading state, and error message from the query", () => {
    mockedUseGame.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: new Error("failed to load"),
      refetch: vi.fn(),
    } as never);

    const { result } = renderHook(() => useGameSession("game-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe("failed to load");
    expect(result.current.game).toBeUndefined();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayGameContent from "./play-game-content";
import { useUser } from "@auth0/nextjs-auth0";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { useGameSession } from "@/domains/game/hooks/use-game-session";
import { GameModeKey } from "@/domains/game/models/game-mode";
import { GameStatus, type Game } from "@/domains/game/models/game";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/game/hooks/use-game-session");
vi.mock("@/domains/game/game-workspace-registry", () => ({
  gameWorkspaceRegistry: {
    solo_rush: {
      Workspace: () => <div>solo-rush-workspace</div>,
      Header: () => <div>solo-rush-header</div>,
      GameOverSummary: () => <div>solo-rush-game-over</div>,
    },
  },
}));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseGameSession = vi.mocked(useGameSession);

function buildGame(overrides: Partial<Game> = {}): Game {
  return {
    gameId: "g1",
    gameModeId: "m1",
    gameModeKey: GameModeKey.SoloRush,
    status: GameStatus.Running,
    timeLimitInSeconds: 600,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    participants: [],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
}

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("PlayGameContent", () => {
  beforeEach(() => {
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
    resetUserStore();
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
    useUserStore.setState({ user: buildUser({ id: "user1" }) });
  });

  it("shows a loading message while the session loads", () => {
    mockUseGameSession.mockReturnValue({
      game: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGameSession>);

    render(<PlayGameContent gameId="g1" />);

    expect(screen.getByText("Loading game...")).toBeVisible();
  });

  it("shows the error message with a retry button", async () => {
    const refetch = vi.fn();
    const user = userEvent.setup();
    mockUseGameSession.mockReturnValue({
      game: undefined,
      isLoading: false,
      error: "Game not found",
      refetch,
    } as unknown as ReturnType<typeof useGameSession>);

    render(<PlayGameContent gameId="g1" />);

    expect(screen.getByText("Game not found")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders the registered workspace and header for a running game", () => {
    mockUseGameSession.mockReturnValue({
      game: buildGame(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGameSession>);

    render(<PlayGameContent gameId="g1" />);

    expect(screen.getByText("solo-rush-workspace")).toBeVisible();
    expect(screen.getByText("solo-rush-header")).toBeVisible();
  });

  it("renders the game over summary once the game is completed", () => {
    mockUseGameSession.mockReturnValue({
      game: buildGame({ status: GameStatus.Completed }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGameSession>);

    render(<PlayGameContent gameId="g1" />);

    expect(screen.getByText("solo-rush-game-over")).toBeVisible();
    expect(screen.queryByText("solo-rush-workspace")).not.toBeInTheDocument();
    expect(screen.queryByText("solo-rush-header")).not.toBeInTheDocument();
  });

  it("treats the game as over for a participant who has forfeited, even while others continue", () => {
    mockUseGameSession.mockReturnValue({
      game: buildGame({
        status: GameStatus.Running,
        participants: [
          {
            userId: "user1",
            username: "me",
            seatNumber: 0,
            joinedAt: new Date(),
            score: 0,
            hasForfeited: true,
            hasFinishedProblems: false,
          },
        ],
      }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGameSession>);

    render(<PlayGameContent gameId="g1" />);

    expect(screen.getByText("solo-rush-game-over")).toBeVisible();
  });

  it("shows an unsupported message for a game mode without a registered strategy", () => {
    mockUseGameSession.mockReturnValue({
      game: buildGame({ gameModeKey: GameModeKey.Duel }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGameSession>);

    render(<PlayGameContent gameId="g1" />);

    expect(
      screen.getByText("This game mode isn't supported yet.")
    ).toBeVisible();
  });
});

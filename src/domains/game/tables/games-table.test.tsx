import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GamesTable from "./games-table";
import { useOpenGames } from "../api/get-open-games";
import { useJoinGame } from "../api/join-game";
import { useLeaveGame } from "../api/leave-game";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildAuthUser } from "@/test/factories/auth-user";
import { GameModeKey } from "../models/game-mode";
import type { GameLobbySummary } from "../models/game-lobby";
import { routerConfig } from "@/shared/router-config";

vi.mock("../api/get-open-games", () => ({ useOpenGames: vi.fn() }));
vi.mock("../api/join-game", () => ({ useJoinGame: vi.fn() }));
vi.mock("../api/leave-game", () => ({ useLeaveGame: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockedUseOpenGames = vi.mocked(useOpenGames);
const mockedUseJoinGame = vi.mocked(useJoinGame);

function buildLobby(
  overrides: Partial<GameLobbySummary> = {}
): GameLobbySummary {
  return {
    gameId: "game-1",
    gameModeKey: GameModeKey.Duel,
    gameModeName: "Duel",
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    minPlayers: 2,
    maxPlayers: 2,
    participantCount: 1,
    hostUsername: "host",
    isHost: false,
    isParticipant: false,
    techStacks: ["Python"],
    ...overrides,
  };
}

describe("GamesTable", () => {
  beforeEach(() => {
    resetUserStore();
    vi.mocked(useLeaveGame).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
    mockedUseJoinGame.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  it("lists open lobbies with their host and player count", () => {
    mockedUseOpenGames.mockReturnValue({
      data: {
        results: [buildLobby()],
        total: 1,
        page: 1,
        size: 10,
        timestamp: "",
      },
      isLoading: false,
    } as never);

    render(<GamesTable />);

    expect(screen.getByText("host")).toBeVisible();
    expect(screen.getByText("1/2")).toBeVisible();
    expect(screen.getByText("Python")).toBeVisible();
  });

  it("disables Join for unauthenticated users", () => {
    mockedUseOpenGames.mockReturnValue({
      data: {
        results: [buildLobby()],
        total: 1,
        page: 1,
        size: 10,
        timestamp: "",
      },
      isLoading: false,
    } as never);

    render(<GamesTable />);

    expect(screen.getByRole("button", { name: "Join" })).toBeDisabled();
  });

  it("joins a lobby when Join is clicked while signed in", async () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    const join = vi.fn();
    mockedUseJoinGame.mockReturnValue({
      mutate: join,
      isPending: false,
    } as never);
    mockedUseOpenGames.mockReturnValue({
      data: {
        results: [buildLobby()],
        total: 1,
        page: 1,
        size: 10,
        timestamp: "",
      },
      isLoading: false,
    } as never);
    const user = userEvent.setup();

    render(<GamesTable />);
    await user.click(screen.getByRole("button", { name: "Join" }));

    expect(join).toHaveBeenCalledWith({ gameId: "game-1" }, expect.anything());
  });

  it("shows Full instead of Join once the lobby has no open seats", () => {
    mockedUseOpenGames.mockReturnValue({
      data: {
        results: [buildLobby({ participantCount: 2 })],
        total: 1,
        page: 1,
        size: 10,
        timestamp: "",
      },
      isLoading: false,
    } as never);

    render(<GamesTable />);

    expect(screen.getByRole("button", { name: "Full" })).toBeDisabled();
  });

  it("opens the lobby for a game the user is already in", async () => {
    const { routerMock } = await import("@/test/mocks/next-navigation");
    mockedUseOpenGames.mockReturnValue({
      data: {
        results: [buildLobby({ isParticipant: true })],
        total: 1,
        page: 1,
        size: 10,
        timestamp: "",
      },
      isLoading: false,
    } as never);
    const user = userEvent.setup();

    render(<GamesTable />);
    await user.click(screen.getByRole("button", { name: "Open lobby" }));

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.gamePlay.execute({ gameId: "game-1" })
    );
  });
});

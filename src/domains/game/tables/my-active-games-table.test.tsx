import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MyActiveGamesTable from "./my-active-games-table";
import { useMyActiveGames } from "../api/get-my-active-games";
import { useLeaveGame } from "../api/leave-game";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildAuthUser } from "@/test/factories/auth-user";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { MyActiveGame } from "../models/my-active-game";
import { routerConfig } from "@/shared/router-config";

vi.mock("../api/get-my-active-games", () => ({ useMyActiveGames: vi.fn() }));
vi.mock("../api/leave-game", () => ({ useLeaveGame: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/shared/lib/signalr/game-hub-client", () => ({
  joinGameUpdates: vi.fn().mockResolvedValue(undefined),
  leaveGameUpdates: vi.fn().mockResolvedValue(undefined),
  onGameLobbyUpdatedPush: vi.fn(() => () => {}),
}));

const mockedUseMyActiveGames = vi.mocked(useMyActiveGames);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function buildActiveGame(overrides: Partial<MyActiveGame> = {}): MyActiveGame {
  return {
    gameId: "game-1",
    gameModeKey: GameModeKey.Duel,
    gameModeName: "Duel",
    status: GameStatus.Running,
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    participantCount: 2,
    maxPlayers: 2,
    isHost: true,
    hostUsername: "host",
    techStacks: ["Python"],
    ...overrides,
  };
}

describe("MyActiveGamesTable", () => {
  beforeEach(() => {
    resetUserStore();
    vi.mocked(useLeaveGame).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  it("renders nothing when the user is not signed in", () => {
    mockedUseMyActiveGames.mockReturnValue({
      data: [buildActiveGame()],
      isLoading: false,
    } as never);

    const { container } = render(<MyActiveGamesTable />, {
      wrapper: createWrapper(),
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when signed in with no active games", () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    mockedUseMyActiveGames.mockReturnValue({
      data: [],
      isLoading: false,
    } as never);

    const { container } = render(<MyActiveGamesTable />, {
      wrapper: createWrapper(),
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("lists the user's active games with a Rejoin action while running", async () => {
    const { routerMock } = await import("@/test/mocks/next-navigation");
    useUserStore.setState({ authProfile: buildAuthUser() });
    mockedUseMyActiveGames.mockReturnValue({
      data: [buildActiveGame()],
      isLoading: false,
    } as never);
    const user = userEvent.setup();

    render(<MyActiveGamesTable />, { wrapper: createWrapper() });

    expect(screen.getByText("In progress")).toBeVisible();
    expect(screen.getByText("Python")).toBeVisible();
    expect(screen.getByText("host")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Rejoin" }));

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.gamePlay.execute({ gameId: "game-1" })
    );
  });

  it("shows a leave option and Open lobby for a still-pending game", () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    mockedUseMyActiveGames.mockReturnValue({
      data: [buildActiveGame({ status: GameStatus.Pending })],
      isLoading: false,
    } as never);

    render(<MyActiveGamesTable />, { wrapper: createWrapper() });

    expect(screen.getByText("Waiting for players")).toBeVisible();
    expect(screen.getByRole("button", { name: "Open lobby" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Leave/ })).toBeVisible();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActiveGamesSidebarCard from "./active-games-sidebar-card";
import { useMyActiveGames } from "../api/get-my-active-games";
import { useLeaveGame } from "../api/leave-game";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { MyActiveGame } from "../models/my-active-game";
import { routerConfig } from "@/shared/router-config";
import { routerMock, usePathname } from "@/test/mocks/next-navigation";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));
vi.mock("../api/leave-game", () => ({ useLeaveGame: vi.fn() }));

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
const mockUsePathname = vi.mocked(usePathname);

vi.mocked(useLeaveGame).mockReturnValue({
  mutate: vi.fn(),
  isPending: false,
} as never);

function buildActiveGame(overrides: Partial<MyActiveGame> = {}): MyActiveGame {
  return {
    gameId: "game-1",
    gameModeKey: GameModeKey.Duel,
    gameModeName: "Duel",
    status: GameStatus.Pending,
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    participantCount: 1,
    maxPlayers: 2,
    isHost: true,
    hostUsername: "host",
    techStacks: ["Python"],
    ...overrides,
  };
}

describe("ActiveGamesSidebarCard", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/dashboard");
    routerMock.push.mockClear();
  });

  it("renders nothing when there are no active games", () => {
    mockUseMyActiveGames.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMyActiveGames>);

    const { container } = render(<ActiveGamesSidebarCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows a waiting-in-lobby message with participant counts while pending", () => {
    mockUseMyActiveGames.mockReturnValue({
      data: [buildActiveGame({ participantCount: 1, maxPlayers: 2 })],
    } as unknown as ReturnType<typeof useMyActiveGames>);

    render(<ActiveGamesSidebarCard />);

    expect(screen.getByText("Waiting in a Duel lobby (1/2)")).toBeVisible();
    expect(screen.getByRole("button", { name: /Go to lobby/ })).toBeVisible();
  });

  it("shows an in-progress message and links to the game once running", async () => {
    const user = userEvent.setup();
    mockUseMyActiveGames.mockReturnValue({
      data: [buildActiveGame({ status: GameStatus.Running })],
    } as unknown as ReturnType<typeof useMyActiveGames>);

    render(<ActiveGamesSidebarCard />);

    expect(screen.getByText("Duel game in progress")).toBeVisible();
    const goToGame = screen.getByRole("button", { name: /Go to game/ });
    await user.click(goToGame);

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.gamePlay.execute({ gameId: "game-1" })
    );
  });

  it("shows a summary card with a count when there are multiple active games", async () => {
    const user = userEvent.setup();
    mockUseMyActiveGames.mockReturnValue({
      data: [buildActiveGame(), buildActiveGame({ gameId: "game-2" })],
    } as unknown as ReturnType<typeof useMyActiveGames>);

    render(<ActiveGamesSidebarCard />);

    expect(screen.getByText("You have 2 active games")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /View my games/ }));

    expect(routerMock.push).toHaveBeenCalledWith(routerConfig.games.execute());
  });

  it("hides the card while already on that game's own page", () => {
    mockUsePathname.mockReturnValue(
      routerConfig.gamePlay.execute({ gameId: "game-1" })
    );
    mockUseMyActiveGames.mockReturnValue({
      data: [buildActiveGame({ gameId: "game-1" })],
    } as unknown as ReturnType<typeof useMyActiveGames>);

    const { container } = render(<ActiveGamesSidebarCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it("hides the summary card for multiple games only on the games list page", () => {
    mockUsePathname.mockReturnValue(routerConfig.games.execute());
    mockUseMyActiveGames.mockReturnValue({
      data: [
        buildActiveGame({ gameId: "game-1" }),
        buildActiveGame({ gameId: "game-2" }),
      ],
    } as unknown as ReturnType<typeof useMyActiveGames>);

    const { container } = render(<ActiveGamesSidebarCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it("dismisses the card and keeps it hidden across rerenders for the same games", async () => {
    const user = userEvent.setup();
    mockUseMyActiveGames.mockReturnValue({
      data: [buildActiveGame({ status: GameStatus.Running })],
    } as unknown as ReturnType<typeof useMyActiveGames>);

    const { rerender } = render(<ActiveGamesSidebarCard />);
    expect(screen.getByText("Duel game in progress")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Duel game in progress")).not.toBeInTheDocument();

    rerender(<ActiveGamesSidebarCard />);
    expect(screen.queryByText("Duel game in progress")).not.toBeInTheDocument();
  });

  it("shows the card again once a dismissed game's status changes", async () => {
    const user = userEvent.setup();
    const pendingGame = buildActiveGame({ status: GameStatus.Pending });
    mockUseMyActiveGames.mockReturnValue({
      data: [pendingGame],
    } as unknown as ReturnType<typeof useMyActiveGames>);

    const { rerender } = render(<ActiveGamesSidebarCard />);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(
      screen.queryByText("Waiting in a Duel lobby (1/2)")
    ).not.toBeInTheDocument();

    mockUseMyActiveGames.mockReturnValue({
      data: [{ ...pendingGame, status: GameStatus.Running }],
    } as unknown as ReturnType<typeof useMyActiveGames>);
    rerender(<ActiveGamesSidebarCard />);

    expect(screen.getByText("Duel game in progress")).toBeVisible();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminGameDetailLayout from "./admin-game-detail-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useUser } from "@auth0/nextjs-auth0";
import { useAdminGameDetail } from "@/domains/game/api/get-admin-game-detail";
import { useAdminGamePlayerHistory } from "@/domains/game/api/get-admin-game-player-history";
import { useGameModes } from "@/domains/game/api/use-game-modes";
import { GameStatus } from "@/domains/game/models/game";
import type { Game } from "@/domains/game/models/game";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/domains/game/api/get-admin-game-detail");
vi.mock("@/domains/game/api/get-admin-game-player-history");
vi.mock("@/domains/game/api/use-game-modes");
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseAdminGameDetail = vi.mocked(useAdminGameDetail);
const mockUseAdminGamePlayerHistory = vi.mocked(useAdminGamePlayerHistory);
const mockUseGameModes = vi.mocked(useGameModes);

function buildGame(overrides: Partial<Game> = {}): Game {
  return {
    gameId: "game_1",
    gameModeId: "mode_1",
    gameModeKey: "duel" as Game["gameModeKey"],
    status: GameStatus.Completed,
    timeLimitInSeconds: 600,
    createdAt: new Date("2026-08-30T00:00:00.000Z"),
    startedAt: new Date("2026-08-30T00:00:05.000Z"),
    endedAt: new Date("2026-08-30T00:10:00.000Z"),
    participants: [],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
}

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminGameDetailLayout", () => {
  beforeEach(() => {
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
    resetUserStore();
    mockUseUser.mockReturnValue({
      user: buildAuthUser(),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_GAMES_READ] }),
    });
    mockUseGameModes.mockReturnValue({
      data: [{ key: "duel", name: "Duel" }],
    } as unknown as ReturnType<typeof useGameModes>);
    mockUseAdminGamePlayerHistory.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminGamePlayerHistory>);
  });

  it("shows a loading state while the game detail is loading", () => {
    mockUseAdminGameDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useAdminGameDetail>);

    render(<AdminGameDetailLayout id="game_1" />);

    expect(screen.getByText("Loading...")).toBeVisible();
  });

  it("shows a not-found message when the game fails to load", () => {
    mockUseAdminGameDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("not found"),
    } as unknown as ReturnType<typeof useAdminGameDetail>);

    render(<AdminGameDetailLayout id="game_1" />);

    expect(screen.getByText("Game not found.")).toBeVisible();
  });

  it("resolves the game mode name and shows participants sorted by score", () => {
    mockUseAdminGameDetail.mockReturnValue({
      data: buildGame({
        participants: [
          {
            userId: "u1",
            username: "trailing",
            seatNumber: 1,
            joinedAt: new Date(),
            score: 2,
            hasForfeited: false,
            hasFinishedProblems: false,
          },
          {
            userId: "u2",
            username: "leading",
            seatNumber: 2,
            joinedAt: new Date(),
            score: 8,
            hasForfeited: false,
            hasFinishedProblems: true,
          },
        ],
      }),
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminGameDetail>);

    render(<AdminGameDetailLayout id="game_1" />);

    const title = screen
      .getByText("Completed")
      .closest('[data-slot="card-title"]') as HTMLElement;
    expect(within(title).getByText("Duel")).toBeVisible();
    expect(within(title).getByText("Completed")).toBeVisible();
    expect(screen.getByText("Finished")).toBeVisible();

    const participantsCard = screen
      .getByText("Participants")
      .closest('[data-slot="card"]') as HTMLElement;
    const rows = within(participantsCard).getAllByRole("listitem");
    expect(within(rows[0]).getByText("leading")).toBeVisible();
    expect(within(rows[1]).getByText("trailing")).toBeVisible();
  });

  it("hides the content behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });
    mockUseAdminGameDetail.mockReturnValue({
      data: buildGame(),
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminGameDetail>);

    render(<AdminGameDetailLayout id="game_1" />);

    expect(screen.getByText("Page not found")).toBeVisible();
    expect(
      screen.queryByRole("navigation", { name: "breadcrumb" })
    ).not.toBeInTheDocument();
  });

  it("shows the Admin > Games > id breadcrumb", () => {
    mockUseAdminGameDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useAdminGameDetail>);

    render(<AdminGameDetailLayout id="game_1" />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByRole("link", { name: "Admin" })).toHaveAttribute(
      "href",
      "/admin"
    );
    expect(breadcrumb.getByRole("link", { name: "Games" })).toHaveAttribute(
      "href",
      "/admin/games"
    );
    expect(breadcrumb.getByText("game_1")).toBeVisible();
  });
});

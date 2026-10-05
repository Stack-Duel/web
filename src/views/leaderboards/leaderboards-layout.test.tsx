import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeaderboardsLayout from "./leaderboards-layout";
import { useGameModes } from "@/domains/game/api/use-game-modes";
import { routerMock, searchParamsMock } from "@/test/mocks/next-navigation";
import { GameModeKey } from "@/domains/game/models/game-mode";
import type { GameMode } from "@/domains/game/models/game-mode";
import { routerConfig } from "@/shared/router-config";
import { useFeatureFlag } from "@/domains/feature-flags/hooks/use-feature-flag";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/domains/game/api/use-game-modes", () => ({ useGameModes: vi.fn() }));
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: vi.fn(),
}));
vi.mock("@/domains/leaderboard/tables/leaderboard-table", () => ({
  default: ({ gameModeKey, timeLimitInSeconds }: never) => (
    <div>
      leaderboard-table:{String(gameModeKey)}:{String(timeLimitInSeconds)}
    </div>
  ),
}));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockedUseGameModes = vi.mocked(useGameModes);
const mockedUseFeatureFlag = vi.mocked(useFeatureFlag);

function buildGameMode(overrides: Partial<GameMode> = {}): GameMode {
  return {
    id: "mode-1",
    key: GameModeKey.SoloRush,
    name: "Solo Rush",
    description: "",
    minPlayers: 1,
    maxPlayers: 1,
    timeOptions: [
      { durationSeconds: 180, isDefault: true },
      { durationSeconds: 300, isDefault: false },
    ],
    ...overrides,
  };
}

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("LeaderboardsLayout", () => {
  beforeEach(() => {
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
    for (const key of [...searchParamsMock.keys()]) {
      searchParamsMock.delete(key);
    }
    routerMock.push.mockClear();
    mockedUseFeatureFlag.mockReturnValue(true);
  });

  it("defaults to Solo Rush at its default time limit", () => {
    mockedUseGameModes.mockReturnValue({
      data: [buildGameMode()],
    } as never);

    render(<LeaderboardsLayout />);

    expect(
      screen.getByText(`leaderboard-table:${GameModeKey.SoloRush}:180`)
    ).toBeVisible();
  });

  it("navigates to the mode-scoped leaderboards route when a mode is selected", async () => {
    mockedUseGameModes.mockReturnValue({
      data: [
        buildGameMode(),
        buildGameMode({ id: "mode-2", key: GameModeKey.Duel, name: "Duel" }),
      ],
    } as never);
    const user = userEvent.setup();

    render(<LeaderboardsLayout />);
    await user.click(screen.getAllByRole("combobox")[0]);
    await user.click(await screen.findByRole("option", { name: "Duel" }));

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.leaderboards.execute({ mode: GameModeKey.Duel })
    );
  });
});

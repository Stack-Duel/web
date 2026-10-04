import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GamesLayout from "./games-layout";
import { useUser } from "@auth0/nextjs-auth0";
import { routerMock, searchParamsMock } from "@/test/mocks/next-navigation";
import { GameModeKey } from "@/domains/game/models/game-mode";
import { routerConfig } from "@/shared/router-config";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/domains/game/tables/games-table", () => ({
  default: () => <div>games-table</div>,
}));
vi.mock("@/domains/game/tables/my-active-games-table", () => ({
  default: () => <div>my-active-games-table</div>,
}));
vi.mock("@/domains/game/components/create-game-dialog", () => ({
  default: ({
    autoOpen,
    defaultModeKey,
  }: {
    autoOpen?: boolean;
    defaultModeKey?: string;
  }) => (
    <div data-auto-open={autoOpen} data-default-mode={defaultModeKey}>
      create-game-dialog
    </div>
  ),
}));
vi.mock("@/domains/game/components/join-by-code-dialog", () => ({
  default: () => <div>join-by-code-dialog</div>,
}));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));
vi.mock("@/domains/game/components/play-solo-rush-card", () => ({
  default: () => <div>play-solo-rush-card</div>,
}));

const mockUseUser = vi.mocked(useUser);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("GamesLayout", () => {
  beforeEach(() => {
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
    for (const key of [...searchParamsMock.keys()]) {
      searchParamsMock.delete(key);
    }
    routerMock.push.mockClear();
    routerMock.replace.mockClear();
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
  });

  it("renders the games and active games tables", () => {
    render(<GamesLayout />);

    expect(screen.getByText("games-table")).toBeVisible();
    expect(screen.getByText("my-active-games-table")).toBeVisible();
    expect(screen.getByText("create-game-dialog")).toBeVisible();
  });

  it("defaults the mode select to all modes when no mode query param is present", () => {
    render(<GamesLayout />);

    expect(screen.getByRole("combobox")).toHaveTextContent("All modes");
  });

  it("navigates to the mode-scoped games route when a mode is selected", async () => {
    const user = userEvent.setup();
    render(<GamesLayout />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Duel" }));

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.games.execute({ mode: GameModeKey.Duel })
    );
  });

  it("navigates back to the unscoped games route when All modes is selected", async () => {
    searchParamsMock.set("mode", GameModeKey.Duel);
    const user = userEvent.setup();
    render(<GamesLayout />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "All modes" }));

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.games.execute({ mode: undefined })
    );
  });

  it("auto-opens the create dialog preselected to Duel when challenge=1 is present", () => {
    searchParamsMock.set("challenge", "1");
    render(<GamesLayout />);

    const dialog = screen.getByText("create-game-dialog");
    expect(dialog).toHaveAttribute("data-auto-open", "true");
    expect(dialog).toHaveAttribute("data-default-mode", GameModeKey.Duel);
  });

  it("strips the challenge param from the URL once consumed", () => {
    searchParamsMock.set("challenge", "1");
    render(<GamesLayout />);

    expect(routerMock.replace).toHaveBeenCalledWith(routerConfig.games.path, {
      scroll: false,
    });
  });

  it("does not auto-open the create dialog without a challenge param", () => {
    render(<GamesLayout />);

    expect(screen.getByText("create-game-dialog")).toHaveAttribute(
      "data-auto-open",
      "false"
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LobbyWorkspace from "./lobby-workspace";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import { GameModeKey } from "../../models/game-mode";
import { GameStatus } from "../../models/game";
import type { Game } from "../../models/game";

vi.mock("@/shared/hooks/use-mobile", () => ({ useIsMobile: vi.fn() }));
vi.mock(
  "@/domains/workspace/editor-window/editor",
  () => import("@/test/mocks/game-editor-window")
);
vi.mock(
  "@/domains/workspace/solution-editor/components/solution-editor",
  () => import("@/test/mocks/game-solution-editor")
);
vi.mock("./lobby-panel", () => ({
  default: () => <div>Lobby panel</div>,
}));

const mockedUseIsMobile = vi.mocked(useIsMobile);

function buildGame(overrides: Partial<Game> = {}): Game {
  return {
    gameId: "game-1",
    gameModeId: "mode-1",
    gameModeKey: GameModeKey.Duel,
    status: GameStatus.Pending,
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    participants: [],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
}

describe("LobbyWorkspace", () => {
  beforeEach(() => {
    useWorkspaceStore.getState().reset();
  });

  it("shows the code and lobby tabs, code first on desktop", () => {
    mockedUseIsMobile.mockReturnValue(false);

    render(<LobbyWorkspace game={buildGame()} />);

    const names = screen.getAllByTestId("tab-name").map((el) => el.textContent);
    expect(names).toEqual(["Code", "Lobby"]);
  });

  it("shows the lobby tab before the code tab on mobile", () => {
    mockedUseIsMobile.mockReturnValue(true);

    render(<LobbyWorkspace game={buildGame()} />);

    const names = screen.getAllByTestId("tab-name").map((el) => el.textContent);
    expect(names).toEqual(["Lobby", "Code"]);
  });

  it("renders a read-only editor with a placeholder message", () => {
    mockedUseIsMobile.mockReturnValue(false);

    render(<LobbyWorkspace game={buildGame()} />);

    expect(
      screen.getByText(
        "// Your solution will appear here once the game starts."
      )
    ).toBeVisible();
    expect(screen.getByTestId("solution-editor")).toHaveAttribute(
      "data-editable",
      "false"
    );
  });
});

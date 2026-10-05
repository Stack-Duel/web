import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MultiplayerWorkspaceHeader from "./multiplayer-workspace-header";
import { GameModeKey } from "../../models/game-mode";
import { GameStatus } from "../../models/game";
import type { Game } from "../../models/game";

vi.mock("../../ramp/components/ramp-workspace-header", () => ({
  default: () => <div>Ramp workspace header</div>,
}));

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

describe("MultiplayerWorkspaceHeader", () => {
  it("renders nothing while the game is Pending", () => {
    const { container } = render(
      <MultiplayerWorkspaceHeader
        game={buildGame({ status: GameStatus.Pending })}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("defers to the ramp workspace header once the game is Running", () => {
    render(
      <MultiplayerWorkspaceHeader
        game={buildGame({
          status: GameStatus.Running,
          gameModeKey: GameModeKey.Ffa,
        })}
      />
    );

    expect(screen.getByText("Ramp workspace header")).toBeVisible();
  });

  it("renders nothing while the server-enforced countdown is still running", () => {
    const { container } = render(
      <MultiplayerWorkspaceHeader
        game={buildGame({
          status: GameStatus.Running,
          startedAt: new Date(Date.now() + 5_000),
        })}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});

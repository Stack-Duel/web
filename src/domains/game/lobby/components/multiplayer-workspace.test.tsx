import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MultiplayerWorkspace from "./multiplayer-workspace";
import { GameModeKey } from "../../models/game-mode";
import { GameStatus } from "../../models/game";
import type { Game } from "../../models/game";

vi.mock("./lobby-workspace", () => ({
  default: () => <div>Lobby workspace</div>,
}));
vi.mock("../../ramp/components/ramp-workspace", () => ({
  default: () => <div>Ramp workspace</div>,
}));
vi.mock("./game-starting-modal", () => ({
  default: () => <div>Game starting modal</div>,
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

describe("MultiplayerWorkspace", () => {
  it("shows the lobby while the game is Pending", () => {
    render(
      <MultiplayerWorkspace game={buildGame({ status: GameStatus.Pending })} />
    );

    expect(screen.getByText("Lobby workspace")).toBeVisible();
  });

  it("shows the ramp workspace once the game is Running", () => {
    render(
      <MultiplayerWorkspace game={buildGame({ status: GameStatus.Running })} />
    );

    expect(screen.getByText("Ramp workspace")).toBeVisible();
  });

  it("shows the ramp workspace once the game is Completed", () => {
    render(
      <MultiplayerWorkspace
        game={buildGame({ status: GameStatus.Completed })}
      />
    );

    expect(screen.getByText("Ramp workspace")).toBeVisible();
  });

  it("shows the starting modal while the server-enforced countdown is still running", () => {
    render(
      <MultiplayerWorkspace
        game={buildGame({
          status: GameStatus.Running,
          startedAt: new Date(Date.now() + 5_000),
        })}
      />
    );

    expect(screen.getByText("Game starting modal")).toBeVisible();
    expect(screen.queryByText("Ramp workspace")).not.toBeInTheDocument();
  });
});

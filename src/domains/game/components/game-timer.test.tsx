import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GameTimer from "./game-timer";
import { GameStatus } from "../models/game";
import { buildGame } from "@/test/factories/game";

describe("GameTimer", () => {
  it("shows the time limit and a not-started label while the game is Pending", () => {
    render(
      <GameTimer
        game={buildGame({ status: GameStatus.Pending, startedAt: undefined })}
        onTimeExpired={vi.fn()}
      />
    );

    expect(screen.getByText("10:00")).toBeVisible();
    expect(screen.getByText("Not started")).toBeVisible();
  });

  it("renders nothing once the game is Completed", () => {
    const { container } = render(
      <GameTimer
        game={buildGame({
          status: GameStatus.Completed,
          startedAt: new Date(),
        })}
        onTimeExpired={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing once the game is Cancelled", () => {
    const { container } = render(
      <GameTimer
        game={buildGame({
          status: GameStatus.Cancelled,
          startedAt: new Date(),
        })}
        onTimeExpired={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows a live countdown once the game is Running and started", () => {
    render(
      <GameTimer
        game={buildGame({ status: GameStatus.Running, startedAt: new Date() })}
        onTimeExpired={vi.fn()}
      />
    );

    expect(screen.getByText("10:00")).toBeVisible();
  });
});

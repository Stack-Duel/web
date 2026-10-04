import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayGamePage from "./page";

vi.mock("@/views/game/play-game-content", () => ({
  default: ({ gameId }: { gameId: string }) => <div>Play Game: {gameId}</div>,
}));

describe("PlayGamePage", () => {
  it("renders the play game content for the resolved game id", async () => {
    render(
      await PlayGamePage({ params: Promise.resolve({ gameId: "game-1" }) })
    );

    expect(screen.getByText("Play Game: game-1")).toBeVisible();
  });
});

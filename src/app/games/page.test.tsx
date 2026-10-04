import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GamesPage from "./page";

vi.mock("@/views/games/games-layout", () => ({
  default: () => <div>Games Layout</div>,
}));

describe("GamesPage", () => {
  it("renders the games layout", async () => {
    render(<GamesPage />);

    expect(await screen.findByText("Games Layout")).toBeVisible();
  });
});

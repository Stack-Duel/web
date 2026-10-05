import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForfeitButton from "./forfeit-button";
import { useForfeitGame } from "@/domains/game/hooks/use-forfeit-game";

vi.mock("@/domains/game/hooks/use-forfeit-game", () => ({
  useForfeitGame: vi.fn(),
}));

const mockedUseForfeitGame = vi.mocked(useForfeitGame);

describe("ForfeitButton", () => {
  it("forfeits the game once the user confirms in the dialog", async () => {
    const forfeit = vi.fn();
    mockedUseForfeitGame.mockReturnValue({
      forfeit,
      isForfeiting: false,
    });
    const user = userEvent.setup();

    render(<ForfeitButton gameId="game-1" />);
    await user.click(screen.getByRole("button", { name: "Forfeit" }));
    await user.click(screen.getByRole("button", { name: "Forfeit game" }));

    expect(forfeit).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeaveLobbyButton from "./leave-lobby-button";
import { useLeaveGame } from "../api/leave-game";

vi.mock("../api/leave-game", () => ({ useLeaveGame: vi.fn() }));

const mockedUseLeaveGame = vi.mocked(useLeaveGame);

describe("LeaveLobbyButton", () => {
  it("leaves the game once the user confirms in the dialog", async () => {
    const mutate = vi.fn();
    mockedUseLeaveGame.mockReturnValue({ mutate, isPending: false } as never);
    const user = userEvent.setup();

    render(<LeaveLobbyButton gameId="game-1" />);
    await user.click(screen.getByRole("button", { name: /Leave/ }));
    await user.click(screen.getByRole("button", { name: "Leave lobby" }));

    expect(mutate).toHaveBeenCalledWith(
      { gameId: "game-1" },
      expect.anything()
    );
  });

  it("calls onLeft once the leave request succeeds", async () => {
    const onLeft = vi.fn();
    const mutate = vi.fn((_variables, options) => options?.onSuccess?.());
    mockedUseLeaveGame.mockReturnValue({ mutate, isPending: false } as never);
    const user = userEvent.setup();

    render(<LeaveLobbyButton gameId="game-1" onLeft={onLeft} />);
    await user.click(screen.getByRole("button", { name: /Leave/ }));
    await user.click(screen.getByRole("button", { name: "Leave lobby" }));

    expect(onLeft).toHaveBeenCalledOnce();
  });

  it("disables the trigger while a leave request is pending", () => {
    mockedUseLeaveGame.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as never);

    render(<LeaveLobbyButton gameId="game-1" />);

    expect(screen.getByRole("button", { name: /Leave/ })).toBeDisabled();
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CloseLobbyButton from "./close-lobby-button";
import { useCloseLobby } from "../api/close-lobby";

vi.mock("../api/close-lobby", () => ({ useCloseLobby: vi.fn() }));

const mockedUseCloseLobby = vi.mocked(useCloseLobby);

describe("CloseLobbyButton", () => {
  it("closes the lobby once the user confirms in the dialog", async () => {
    const mutate = vi.fn();
    mockedUseCloseLobby.mockReturnValue({ mutate, isPending: false } as never);
    const user = userEvent.setup();

    render(<CloseLobbyButton gameId="game-1" />);
    await user.click(screen.getByRole("button", { name: /Close lobby/ }));
    const buttons = screen.getAllByRole("button", { name: "Close lobby" });
    await user.click(buttons[buttons.length - 1]);

    expect(mutate).toHaveBeenCalledWith({ gameId: "game-1" });
  });

  it("disables the trigger while a close request is pending", () => {
    mockedUseCloseLobby.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as never);

    render(<CloseLobbyButton gameId="game-1" />);

    expect(screen.getByRole("button", { name: /Close lobby/ })).toBeDisabled();
  });
});

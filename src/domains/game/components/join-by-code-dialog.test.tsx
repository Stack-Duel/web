import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import JoinByCodeDialog from "./join-by-code-dialog";
import { useJoinGameByCode } from "@/domains/game/api/join-game-by-code";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildAuthUser } from "@/test/factories/auth-user";

vi.mock("@/domains/game/api/join-game-by-code", () => ({
  useJoinGameByCode: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockedUseJoinGameByCode = vi.mocked(useJoinGameByCode);

describe("JoinByCodeDialog", () => {
  beforeEach(() => {
    resetUserStore();
    vi.clearAllMocks();
    mockedUseJoinGameByCode.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  it("disables the join button when the user is not signed in", () => {
    render(<JoinByCodeDialog />);

    expect(
      screen.getByRole("button", { name: /join with code/i })
    ).toBeDisabled();
  });

  it("opens the dialog when signed in", async () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();

    render(<JoinByCodeDialog />);
    await user.click(screen.getByRole("button", { name: /join with code/i }));

    expect(screen.getByText("Join with a code")).toBeVisible();
  });

  it("toasts an error when trying to join without entering a code", async () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();

    render(<JoinByCodeDialog />);
    await user.click(screen.getByRole("button", { name: /join with code/i }));
    await user.click(screen.getByRole("button", { name: "Join game" }));

    expect(toast.error).toHaveBeenCalledWith("Enter a code to join a game.");
  });

  it("toasts an error when the code isn't 7 characters", async () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();

    render(<JoinByCodeDialog />);
    await user.click(screen.getByRole("button", { name: /join with code/i }));
    await user.type(screen.getByPlaceholderText(/e.g. ab2cd3e/i), "abc");
    await user.click(screen.getByRole("button", { name: "Join game" }));

    expect(toast.error).toHaveBeenCalledWith(
      "Codes are 7 characters long. Check for typos."
    );
  });

  it("joins with the entered code and navigates to the game", async () => {
    const mutate = vi.fn(
      (_args, options?: { onSuccess?: (gameId: string) => void }) => {
        options?.onSuccess?.("game-1");
      }
    );
    mockedUseJoinGameByCode.mockReturnValue({
      mutate,
      isPending: false,
    } as never);
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();

    render(<JoinByCodeDialog />);
    await user.click(screen.getByRole("button", { name: /join with code/i }));
    await user.type(screen.getByPlaceholderText(/e.g. ab2cd3e/i), "abc1234");
    await user.click(screen.getByRole("button", { name: "Join game" }));

    expect(mutate).toHaveBeenCalledWith(
      { joinCode: "ABC1234" },
      expect.anything()
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import JoinGameContent from "./join-game-content";
import { useJoinGameByCode } from "@/domains/game/api/join-game-by-code";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildAuthUser } from "@/test/factories/auth-user";
import { routerMock } from "@/test/mocks/next-navigation";

vi.mock("@/domains/game/api/join-game-by-code", () => ({
  useJoinGameByCode: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockedUseJoinGameByCode = vi.mocked(useJoinGameByCode);

describe("JoinGameContent", () => {
  beforeEach(() => {
    resetUserStore();
    vi.clearAllMocks();
    routerMock.replace.mockClear();
    mockedUseJoinGameByCode.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  it("prompts an unauthenticated visitor to sign in with a returnTo back to the invite", () => {
    render(<JoinGameContent code="ABC1234" />);

    expect(
      screen.getByRole("link", { name: /sign in to join/i })
    ).toHaveAttribute("href", "/auth/login?returnTo=%2Fjoin%2FABC1234");
  });

  it("joins the game and redirects when an authenticated visitor clicks Join Game", async () => {
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

    render(<JoinGameContent code="ABC1234" />);
    await user.click(screen.getByRole("button", { name: "Join Game" }));

    expect(mutate).toHaveBeenCalledWith(
      { joinCode: "ABC1234" },
      expect.anything()
    );
    expect(routerMock.replace).toHaveBeenCalledWith("/game/play/game-1");
  });

  it("shows an error message when the code is invalid", async () => {
    const mutate = vi.fn(
      (_args, options?: { onError?: (error: Error) => void }) => {
        options?.onError?.(new Error("This invite is no longer valid."));
      }
    );
    mockedUseJoinGameByCode.mockReturnValue({
      mutate,
      isPending: false,
    } as never);
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();

    render(<JoinGameContent code="ABC1234" />);
    await user.click(screen.getByRole("button", { name: "Join Game" }));

    expect(
      await screen.findByText("This invite is no longer valid.")
    ).toBeVisible();
    expect(toast.error).toHaveBeenCalledWith("This invite is no longer valid.");
  });
});

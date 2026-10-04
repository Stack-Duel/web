import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RampQuickReactions from "./ramp-quick-reactions";
import { sendGameReaction } from "@/shared/lib/signalr/game-hub-client";
import { QUICK_REACTIONS } from "../quick-reactions";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/shared/lib/signalr/game-hub-client", () => ({
  sendGameReaction: vi.fn().mockResolvedValue(undefined),
}));

const mockedSendGameReaction = vi.mocked(sendGameReaction);

describe("RampQuickReactions", () => {
  it("renders one button per configured quick reaction", () => {
    render(<RampQuickReactions gameId="game-1" />);

    for (const emoji of QUICK_REACTIONS) {
      expect(
        screen.getByRole("button", { name: `React with ${emoji}` })
      ).toBeVisible();
    }
  });

  it("sends the clicked emoji for the given game", async () => {
    const user = userEvent.setup();

    render(<RampQuickReactions gameId="game-1" />);

    await user.click(
      screen.getByRole("button", { name: `React with ${QUICK_REACTIONS[0]}` })
    );

    expect(mockedSendGameReaction).toHaveBeenCalledWith(
      "game-1",
      QUICK_REACTIONS[0]
    );
  });

  describe("send cooldown", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("disables the row briefly after sending, then re-enables it", () => {
      render(<RampQuickReactions gameId="game-1" />);
      const button = screen.getByRole("button", {
        name: `React with ${QUICK_REACTIONS[0]}`,
      });

      fireEvent.click(button);
      expect(button).toBeDisabled();

      act(() => {
        vi.advanceTimersByTime(800);
      });

      expect(button).not.toBeDisabled();
    });
  });
});

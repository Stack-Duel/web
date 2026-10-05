import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProblemReactionButtons } from "./problem-reaction-buttons";
import { useProblemReactionSummary } from "../api/get-problem-reaction-summary";
import { useSetProblemReaction } from "../api/set-problem-reaction";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildAuthUser } from "@/test/factories/auth-user";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("../api/get-problem-reaction-summary");
vi.mock("../api/set-problem-reaction");

const mockUseProblemReactionSummary = vi.mocked(useProblemReactionSummary);
const mockUseSetProblemReaction = vi.mocked(useSetProblemReaction);

describe("ProblemReactionButtons", () => {
  const mutate = vi.fn();

  beforeEach(() => {
    resetUserStore();
    mutate.mockReset();
    mockUseProblemReactionSummary.mockReturnValue({
      data: {
        counts: [
          { key: "like", count: 3 },
          { key: "dislike", count: 1 },
        ],
        currentUserReactionKey: null,
      },
    } as unknown as ReturnType<typeof useProblemReactionSummary>);
    mockUseSetProblemReaction.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSetProblemReaction>);
  });

  it("disables both buttons and explains why for a signed-out visitor", () => {
    render(<ProblemReactionButtons problemId="p1" />);

    const like = screen.getByRole("button", { name: "Like" });
    const dislike = screen.getByRole("button", { name: "Dislike" });

    expect(like).toBeDisabled();
    expect(dislike).toBeDisabled();
    expect(like).toHaveAttribute("title", "Sign in to react");
    expect(dislike).toHaveAttribute("title", "Sign in to react");
  });

  it("enables the buttons and reacts when signed in", async () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();
    render(<ProblemReactionButtons problemId="p1" />);

    const like = screen.getByRole("button", { name: "Like" });
    expect(like).toBeEnabled();
    expect(like).not.toHaveAttribute("title");

    await user.click(like);

    expect(mutate).toHaveBeenCalledWith({
      problemId: "p1",
      reactionTypeKey: "like",
    });
  });
});

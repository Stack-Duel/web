import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DailyChallengeCard from "./daily-challenge-card";
import { useTodaysDailyChallenge } from "../api/get-todays-daily-challenge";

vi.mock("../api/get-todays-daily-challenge", () => ({
  useTodaysDailyChallenge: vi.fn(),
}));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockUseTodaysDailyChallenge = vi.mocked(useTodaysDailyChallenge);

function mockChallenge(
  data: unknown,
  extra: Partial<ReturnType<typeof useTodaysDailyChallenge>> = {}
) {
  mockUseTodaysDailyChallenge.mockReturnValue({
    data,
    isLoading: false,
    ...extra,
  } as unknown as ReturnType<typeof useTodaysDailyChallenge>);
}

describe("DailyChallengeCard", () => {
  it("shows a loading skeleton while the challenge is loading", () => {
    mockChallenge(undefined, { isLoading: true });

    render(<DailyChallengeCard />);

    expect(screen.queryByText("Solve")).not.toBeInTheDocument();
  });

  it("shows an empty state when there is no daily challenge configured", () => {
    mockChallenge(undefined);

    render(<DailyChallengeCard />);

    expect(
      screen.getByText(
        "No daily challenge available right now — check back soon."
      )
    ).toBeVisible();
  });

  it("shows the problem and a solve link when unsolved", () => {
    mockChallenge({
      problemId: "p1",
      slug: "two-sum",
      title: "Two Sum",
      difficultyTier: "Easy",
      solvedByCurrentUser: false,
      currentStreak: 0,
      longestStreak: 0,
    });

    render(<DailyChallengeCard />);

    expect(screen.getByText("Two Sum")).toBeVisible();
    expect(screen.getByRole("link", { name: "Solve" })).toHaveAttribute(
      "href",
      "/problems/two-sum"
    );
  });

  it("shows a solved state instead of the solve link when already solved", () => {
    mockChallenge({
      problemId: "p1",
      slug: "two-sum",
      title: "Two Sum",
      difficultyTier: "Easy",
      solvedByCurrentUser: true,
      currentStreak: 1,
      longestStreak: 1,
    });

    render(<DailyChallengeCard />);

    expect(screen.getByText("Solved today")).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Solve" })
    ).not.toBeInTheDocument();
  });
});

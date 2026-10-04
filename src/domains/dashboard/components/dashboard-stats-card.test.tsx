import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardStatsCard from "./dashboard-stats-card";
import { useUserGameStats } from "@/domains/user/api/get-user-game-stats";
import { useUserStore } from "@/domains/user/state/user-store";
import { useTodaysDailyChallenge } from "@/domains/daily-challenge/api/get-todays-daily-challenge";
import { buildUser } from "@/test/factories/user";

vi.mock("@/domains/user/api/get-user-game-stats", () => ({
  useUserGameStats: vi.fn(),
}));
vi.mock("@/domains/daily-challenge/api/get-todays-daily-challenge", () => ({
  useTodaysDailyChallenge: vi.fn(),
}));

const mockUseUserGameStats = vi.mocked(useUserGameStats);
const mockUseTodaysDailyChallenge = vi.mocked(useTodaysDailyChallenge);

describe("DashboardStatsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ user: buildUser({ username: "testuser" }) });
    mockUseTodaysDailyChallenge.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodaysDailyChallenge>);
  });

  it("sums wins across game modes and shows the daily streaks", () => {
    mockUseUserGameStats.mockReturnValue({
      data: {
        gameModeStats: [
          { gamesPlayed: 5, wins: 3, losses: 2, bestScore: 10 },
          { gamesPlayed: 2, wins: 1, losses: 1, bestScore: 4 },
        ],
      },
    } as unknown as ReturnType<typeof useUserGameStats>);
    mockUseTodaysDailyChallenge.mockReturnValue({
      data: {
        currentStreak: 3,
        longestStreak: 7,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useTodaysDailyChallenge>);

    render(<DashboardStatsCard />);

    expect(screen.getByText("Wins")).toBeVisible();
    expect(screen.getByText("4")).toBeVisible();
    expect(screen.getByText("3")).toBeVisible();
    expect(screen.getByText("7")).toBeVisible();
  });

  it("shows zero streaks when there is no daily challenge configured", () => {
    mockUseUserGameStats.mockReturnValue({
      data: { gameModeStats: [] },
    } as unknown as ReturnType<typeof useUserGameStats>);
    mockUseTodaysDailyChallenge.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodaysDailyChallenge>);

    render(<DashboardStatsCard />);

    expect(screen.getAllByText("0")).toHaveLength(3);
  });

  it("shows a loading skeleton for the streak tiles while the request is in flight", () => {
    mockUseUserGameStats.mockReturnValue({
      data: { gameModeStats: [] },
    } as unknown as ReturnType<typeof useUserGameStats>);
    mockUseTodaysDailyChallenge.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useTodaysDailyChallenge>);

    render(<DashboardStatsCard />);

    expect(screen.getByText("Current streak")).toBeVisible();
    expect(screen.getByText("Longest streak")).toBeVisible();
    expect(screen.getAllByText("0")).toHaveLength(1);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardStatsCard from "./dashboard-stats-card";
import { useMyDashboardStats } from "../api/get-my-dashboard-stats";

vi.mock("../api/get-my-dashboard-stats", () => ({
  useMyDashboardStats: vi.fn(),
}));

const mockUseMyDashboardStats = vi.mocked(useMyDashboardStats);

const mockStats = (data: unknown) =>
  mockUseMyDashboardStats.mockReturnValue({ data } as unknown as ReturnType<
    typeof useMyDashboardStats
  >);

describe("DashboardStatsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the wins and streaks from the stats query", () => {
    mockStats({ wins: 4, currentStreak: 3, longestStreak: 7 });

    render(<DashboardStatsCard />);

    expect(screen.getByText("Wins")).toBeVisible();
    expect(screen.getByText("4")).toBeVisible();
    expect(screen.getByText("3")).toBeVisible();
    expect(screen.getByText("7")).toBeVisible();
  });

  it("shows zeroes when the user has no wins or streaks", () => {
    mockStats({ wins: 0, currentStreak: 0, longestStreak: 0 });

    render(<DashboardStatsCard />);

    expect(screen.getAllByText("0")).toHaveLength(3);
  });

  it("shows loading skeletons for every tile while the request is in flight", () => {
    mockStats(undefined);

    render(<DashboardStatsCard />);

    expect(screen.getByText("Wins")).toBeVisible();
    expect(screen.getByText("Current streak")).toBeVisible();
    expect(screen.getByText("Longest streak")).toBeVisible();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});

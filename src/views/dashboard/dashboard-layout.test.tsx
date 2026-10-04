import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen } from "@testing-library/react";
import DashboardLayout from "./dashboard-layout";
import { useUser } from "@auth0/nextjs-auth0";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/game/components/play-duel-card", () => ({
  default: () => <div>play-duel-card</div>,
}));
vi.mock("@/domains/game/components/play-ffa-card", () => ({
  default: () => <div>play-ffa-card</div>,
}));
vi.mock("@/domains/game/components/play-solo-rush-card", () => ({
  default: () => <div>play-solo-rush-card</div>,
}));
vi.mock("@/domains/problem/tables/problem-table", () => ({
  default: () => <div>problem-table</div>,
}));
vi.mock("@/domains/dashboard/components/dashboard-stats-card", () => ({
  default: () => <div>dashboard-stats-card</div>,
}));
vi.mock("@/domains/daily-challenge/components/daily-challenge-card", () => ({
  default: () => <div>daily-challenge-card</div>,
}));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("DashboardLayout", () => {
  beforeEach(() => {
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
  });

  it("renders the game mode cards and the problem table", async () => {
    render(<DashboardLayout />);

    expect(screen.getByText("dashboard-stats-card")).toBeVisible();
    expect(screen.getByText("daily-challenge-card")).toBeVisible();
    expect(screen.getByText("play-duel-card")).toBeVisible();
    expect(screen.getByText("play-ffa-card")).toBeVisible();
    expect(await screen.findByText("play-solo-rush-card")).toBeVisible();
    expect(screen.getByText("problem-table")).toBeVisible();
  });

  it("shows a labeled Discord link in the header", () => {
    render(<DashboardLayout />);

    const link = screen.getByRole("link", { name: "Join the Discord" });
    expect(link).toHaveAttribute("href", "https://discord.gg/3mW6Y9N5xZ");
    expect(link).toHaveAttribute("target", "_blank");
  });
});

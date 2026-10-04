import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen } from "@testing-library/react";
import AdminDailyChallengesLayout from "./admin-daily-challenges-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useUser } from "@auth0/nextjs-auth0";
import { useUpcomingDailyChallenges } from "@/domains/daily-challenge/api/get-upcoming-daily-challenges";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/daily-challenge/api/get-upcoming-daily-challenges");
vi.mock(
  "@/domains/daily-challenge/components/update-daily-challenge-dialog",
  () => ({
    default: () => <div>update-daily-challenge-dialog</div>,
  })
);
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseUpcomingDailyChallenges = vi.mocked(useUpcomingDailyChallenges);
const mockUseMyActiveGames = vi.mocked(useMyActiveGames);

describe("AdminDailyChallengesLayout", () => {
  beforeEach(() => {
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
    resetUserStore();
    mockUseUser.mockReturnValue({
      user: buildAuthUser(),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_PROBLEMS_READ] }),
    });
    mockUseUpcomingDailyChallenges.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useUpcomingDailyChallenges>);
  });

  it("hides the content behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(<AdminDailyChallengesLayout />);

    expect(screen.getByText("Page not found")).toBeVisible();
  });

  it("shows an empty state when nothing is scheduled", () => {
    render(<AdminDailyChallengesLayout />);

    expect(
      screen.getByText("No upcoming daily challenges are scheduled yet.")
    ).toBeVisible();
  });

  it("lists upcoming challenges with a change control", () => {
    mockUseUpcomingDailyChallenges.mockReturnValue({
      data: [
        {
          date: "2026-10-05",
          problemId: "p1",
          problemSlug: "two-sum",
          problemTitle: "Two Sum",
          difficultyTier: "easy",
          status: "Published",
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useUpcomingDailyChallenges>);

    render(<AdminDailyChallengesLayout />);

    expect(screen.getByText("2026-10-05")).toBeVisible();
    expect(screen.getByText("Two Sum")).toBeVisible();
    expect(screen.getByText("update-daily-challenge-dialog")).toBeVisible();
  });
});

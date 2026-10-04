import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminDashboardLayout from "./admin-dashboard-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useUser } from "@auth0/nextjs-auth0";
import { useAdminDashboardStats } from "@/domains/dashboard/api/get-admin-dashboard-stats";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/domains/dashboard/api/get-admin-dashboard-stats");
vi.mock("@/domains/dashboard/components/new-users-chart", () => ({
  NewUsersChart: () => <div>new-users-chart</div>,
}));
vi.mock("@/domains/dashboard/components/feedback-status-chart", () => ({
  FeedbackStatusChart: () => <div>feedback-status-chart</div>,
}));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseAdminDashboardStats = vi.mocked(useAdminDashboardStats);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminDashboardLayout", () => {
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
    mockUseAdminDashboardStats.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useAdminDashboardStats>);
  });

  it("hides the dashboard behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(<AdminDashboardLayout />);

    expect(screen.getByText("Page not found")).toBeVisible();
    expect(
      screen.queryByRole("navigation", { name: "breadcrumb" })
    ).not.toBeInTheDocument();
  });

  it("shows stat tiles and charts for a user with dashboard read access", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_DASHBOARD_READ] }),
    });
    mockUseAdminDashboardStats.mockReturnValue({
      data: {
        totalUsers: 100,
        totalProblems: 20,
        totalGames: 15,
        totalSubmissions: 300,
        newUsersByDay: [],
        feedbackByStatus: [],
      },
    } as unknown as ReturnType<typeof useAdminDashboardStats>);

    render(<AdminDashboardLayout />);

    expect(screen.getByText("Users")).toBeVisible();
    expect(screen.getByText("100")).toBeVisible();
    expect(screen.getByText("300")).toBeVisible();
    expect(screen.getByText("new-users-chart")).toBeVisible();
    expect(screen.getByText("feedback-status-chart")).toBeVisible();
  });

  it("links all four stat tiles to their admin sections", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_DASHBOARD_READ] }),
    });
    mockUseAdminDashboardStats.mockReturnValue({
      data: {
        totalUsers: 100,
        totalProblems: 20,
        totalGames: 15,
        totalSubmissions: 300,
        newUsersByDay: [],
        feedbackByStatus: [],
      },
    } as unknown as ReturnType<typeof useAdminDashboardStats>);

    render(<AdminDashboardLayout />);

    expect(screen.getByRole("link", { name: "View Users" })).toHaveAttribute(
      "href",
      "/admin/users"
    );
    expect(screen.getByRole("link", { name: "View Problems" })).toHaveAttribute(
      "href",
      "/admin/problems"
    );
    expect(
      screen.getByRole("link", { name: "View Submissions" })
    ).toHaveAttribute("href", "/admin/submissions");
    expect(screen.getByRole("link", { name: "View Games" })).toHaveAttribute(
      "href",
      "/admin/games"
    );
  });

  it("links 'View all' to the admin feedback list", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_DASHBOARD_READ] }),
    });

    render(<AdminDashboardLayout />);

    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/admin/feedback"
    );
  });

  it("shows the Admin breadcrumb", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_DASHBOARD_READ] }),
    });

    render(<AdminDashboardLayout />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByText("Admin")).toBeVisible();
  });
});

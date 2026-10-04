import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminSubmissionsLayout from "./admin-submissions-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useUser } from "@auth0/nextjs-auth0";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/domains/submission/tables/admin-submissions-table", () => ({
  default: () => <div>admin-submissions-table</div>,
}));
vi.mock(
  "@/domains/submission/components/admin-submission-search-input",
  () => ({
    default: () => <div>admin-submission-search-input</div>,
  })
);
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminSubmissionsLayout", () => {
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
  });

  it("shows the table and search input to a user with submissions admin read access", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_SUBMISSIONS_READ] }),
    });

    render(<AdminSubmissionsLayout />);

    expect(screen.getByText("admin-submissions-table")).toBeVisible();
    expect(screen.getByText("admin-submission-search-input")).toBeVisible();
  });

  it("hides the table and search input behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(<AdminSubmissionsLayout />);

    expect(screen.getByText("Page not found")).toBeVisible();
    expect(
      screen.queryByRole("navigation", { name: "breadcrumb" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("admin-submissions-table")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("admin-submission-search-input")
    ).not.toBeInTheDocument();
  });

  it("shows the Admin > Submissions breadcrumb", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_SUBMISSIONS_READ] }),
    });

    render(<AdminSubmissionsLayout />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByText("Admin")).toBeVisible();
    expect(breadcrumb.getByText("Submissions")).toBeVisible();
  });
});

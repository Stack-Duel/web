import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminUserDetailLayout from "./admin-user-detail-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { buildAdminUserDetail } from "@/test/factories/user-admin-user-detail";
import { buildGroup } from "@/test/factories/user-group";
import { Permissions } from "@/shared/lib/permissions";
import { useUser } from "@auth0/nextjs-auth0";
import { useAdminUserDetail } from "@/domains/user/api/get-admin-user-detail";
import { useGroups } from "@/domains/user/api/get-groups";
import { useUpdateUserGroups } from "@/domains/user/api/update-user-groups";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/domains/user/api/get-admin-user-detail");
vi.mock("@/domains/user/api/get-groups");
vi.mock("@/domains/user/api/update-user-groups");
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseAdminUserDetail = vi.mocked(useAdminUserDetail);
const mockUseGroups = vi.mocked(useGroups);
const mockUseUpdateUserGroups = vi.mocked(useUpdateUserGroups);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminUserDetailLayout", () => {
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
      user: buildUser({
        permissions: [
          Permissions.ADMIN_USERS_READ,
          Permissions.ADMIN_USER_GROUPS_UPDATE,
        ],
      }),
    });
    mockUseGroups.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>);
    mockUseUpdateUserGroups.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateUserGroups>);
  });

  it("shows a loading state while the user detail is loading", () => {
    mockUseAdminUserDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useAdminUserDetail>);

    render(<AdminUserDetailLayout id="user-1" />);

    expect(screen.getByText("Loading...")).toBeVisible();
  });

  it("shows a not-found message when the user fails to load", () => {
    mockUseAdminUserDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("not found"),
    } as unknown as ReturnType<typeof useAdminUserDetail>);

    render(<AdminUserDetailLayout id="user-1" />);

    expect(screen.getByText("User not found.")).toBeVisible();
  });

  it("shows the user's basic information and groups", () => {
    mockUseAdminUserDetail.mockReturnValue({
      data: buildAdminUserDetail({
        username: "iris23",
        bio: "Loves algorithms.",
        isPrivate: true,
        createdAt: new Date("2026-03-01T08:15:30.000Z"),
        setupCompletedAt: new Date("2026-03-01T08:20:00.000Z"),
        groups: [buildGroup({ name: "Testers" })],
      }),
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminUserDetail>);

    render(<AdminUserDetailLayout id="user-1" />);

    expect(screen.getByText("iris23")).toBeVisible();
    expect(screen.getByText("Loves algorithms.")).toBeVisible();
    expect(screen.getByText("Private")).toBeVisible();
    expect(screen.getByText("Setup complete")).toBeVisible();
    expect(screen.getByText("Testers")).toBeVisible();
    expect(
      screen.getByText(new Date("2026-03-01T08:15:30.000Z").toLocaleString())
    ).toBeVisible();
  });

  it("shows setup-incomplete when the user hasn't finished setup", () => {
    mockUseAdminUserDetail.mockReturnValue({
      data: buildAdminUserDetail({ setupCompletedAt: undefined }),
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminUserDetail>);

    render(<AdminUserDetailLayout id="user-1" />);

    expect(screen.getByText("Setup incomplete")).toBeVisible();
  });

  it("hides the content behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });
    mockUseAdminUserDetail.mockReturnValue({
      data: buildAdminUserDetail(),
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminUserDetail>);

    render(<AdminUserDetailLayout id="user-1" />);

    expect(screen.getByText("Page not found")).toBeVisible();
    expect(
      screen.queryByRole("navigation", { name: "breadcrumb" })
    ).not.toBeInTheDocument();
  });

  it("shows the Admin > Users > id breadcrumb", () => {
    mockUseAdminUserDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useAdminUserDetail>);

    render(<AdminUserDetailLayout id="user-1" />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByRole("link", { name: "Admin" })).toHaveAttribute(
      "href",
      "/admin"
    );
    expect(breadcrumb.getByRole("link", { name: "Users" })).toHaveAttribute(
      "href",
      "/admin/users"
    );
    expect(breadcrumb.getByText("user-1")).toBeVisible();
  });
});

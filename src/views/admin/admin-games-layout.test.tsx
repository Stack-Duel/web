import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminGamesLayout from "./admin-games-layout";
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
vi.mock("@/domains/game/tables/admin-games-table", () => ({
  default: () => <div>admin-games-table</div>,
}));
vi.mock("@/domains/game/components/admin-game-filters", () => ({
  default: () => <div>admin-game-filters</div>,
}));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminGamesLayout", () => {
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

  it("shows the table and filters to a user with games admin read access", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_GAMES_READ] }),
    });

    render(<AdminGamesLayout />);

    expect(screen.getByText("admin-games-table")).toBeVisible();
    expect(screen.getByText("admin-game-filters")).toBeVisible();
  });

  it("hides the table and filters behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(<AdminGamesLayout />);

    expect(screen.getByText("Page not found")).toBeVisible();
    expect(screen.queryByText("admin-games-table")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "breadcrumb" })
    ).not.toBeInTheDocument();
  });

  it("shows the Admin > Games breadcrumb, with Admin linking back to the dashboard", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_GAMES_READ] }),
    });

    render(<AdminGamesLayout />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByRole("link", { name: "Admin" })).toHaveAttribute(
      "href",
      "/admin"
    );
    expect(breadcrumb.getByText("Games")).toBeVisible();
  });
});

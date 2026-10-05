import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import SidebarLayout from "./sidebar-layout";
import { useUser } from "@auth0/nextjs-auth0";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { Permissions } from "@/shared/lib/permissions";
import { buildUser } from "@/test/factories/user";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseMyActiveGames = vi.mocked(useMyActiveGames);

describe("SidebarLayout", () => {
  beforeEach(() => {
    resetUserStore();
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
  });

  it("renders the sidebar, header breadcrumbs, and children", () => {
    render(
      <SidebarLayout
        breadcrumbs={[
          { name: "Problems", url: "/problems" },
          { name: "Two Sum" },
        ]}
      >
        <p>Problem content</p>
      </SidebarLayout>
    );

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByRole("link", { name: "Problems" })).toHaveAttribute(
      "href",
      "/problems"
    );
    expect(screen.getByText("Two Sum")).toBeVisible();
    expect(screen.getByText("Problem content")).toBeVisible();
  });

  it("shows an admin nav item when the user has an admin read permission", () => {
    useUserStore.setState({
      user: buildUser({ permissions: [Permissions.ADMIN_USERS_READ] }),
    });

    render(<SidebarLayout breadcrumbs={[]} />);

    expect(screen.getByRole("link", { name: /Admin/ })).toBeVisible();
  });

  it("does not show an admin nav item for a user without admin permissions", () => {
    render(<SidebarLayout breadcrumbs={[]} />);

    expect(
      screen.queryByRole("link", { name: /Admin/ })
    ).not.toBeInTheDocument();
  });
});

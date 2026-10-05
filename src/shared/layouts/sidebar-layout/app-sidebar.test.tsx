import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppSidebar from "./app-sidebar";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { useUser } from "@auth0/nextjs-auth0";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { routerConfig } from "@/shared/router-config";
import { useFeatureFlag } from "@/domains/feature-flags/hooks/use-feature-flag";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: vi.fn(),
}));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseFeatureFlag = vi.mocked(useFeatureFlag);
const mockUseMyActiveGames = vi.mocked(useMyActiveGames);

function renderSidebar() {
  return render(
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </TooltipProvider>
  );
}

describe("AppSidebar", () => {
  beforeEach(() => {
    resetUserStore();
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
    mockUseFeatureFlag.mockReturnValue(true);
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
  });

  it("links Home to the home page for a guest", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: /Home/ })).toHaveAttribute(
      "href",
      routerConfig.home.path
    );
  });

  it("links to Dashboard instead of Home for an authenticated user", () => {
    mockUseUser.mockReturnValue({
      user: buildAuthUser(),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });

    renderSidebar();

    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      routerConfig.dashboard.path
    );
    expect(
      screen.queryByRole("link", { name: /^Home/ })
    ).not.toBeInTheDocument();
  });

  it("links Problems and Games to their routes", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: /Problems/ })).toHaveAttribute(
      "href",
      routerConfig.problems.path
    );
    expect(screen.getByRole("link", { name: /^Games/ })).toHaveAttribute(
      "href",
      routerConfig.games.execute()
    );
  });

  it("opens Community to external Discord, GitHub, and LinkedIn links instead of a page", async () => {
    const user = userEvent.setup();
    renderSidebar();

    expect(
      screen.queryByRole("link", { name: /Community/ })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Community/ }));

    for (const [name, href] of [
      ["Discord", "https://discord.gg/3mW6Y9N5xZ"],
      ["GitHub", "https://github.com/algowars"],
      ["LinkedIn", "https://www.linkedin.com/company/106262028/"],
    ]) {
      const link = screen.getByRole("link", { name: new RegExp(name) });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("links Leaderboards to its route", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: /Leaderboards/ })).toHaveAttribute(
      "href",
      routerConfig.leaderboards.execute()
    );
  });

  it("hides Leaderboards when the leaderboards feature flag is disabled", () => {
    mockUseFeatureFlag.mockReturnValue(false);

    renderSidebar();

    expect(
      screen.queryByRole("link", { name: /Leaderboards/ })
    ).not.toBeInTheDocument();
  });

  it("does not show an Admin nav item without any admin permission", () => {
    renderSidebar();

    expect(
      screen.queryByRole("link", { name: /Admin/ })
    ).not.toBeInTheDocument();
  });

  it("always links Admin to the dashboard, regardless of which admin permission is held", () => {
    useUserStore.setState({
      user: buildUser({ permissions: [Permissions.ADMIN_PROBLEMS_READ] }),
    });

    renderSidebar();

    expect(screen.getByRole("link", { name: /Admin/ })).toHaveAttribute(
      "href",
      routerConfig.admin.path
    );
  });

  it("shows a Dashboard sub-item only with the dashboard permission", async () => {
    const user = userEvent.setup();
    useUserStore.setState({
      user: buildUser({ permissions: [Permissions.ADMIN_DASHBOARD_READ] }),
    });

    renderSidebar();
    const adminMenuItem = screen
      .getByRole("link", { name: "Admin" })
      .closest("li") as HTMLElement;
    await user.click(
      within(adminMenuItem).getByRole("button", { name: "Toggle" })
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      routerConfig.admin.path
    );
  });

  it("shows a Games sub-item under Admin only with the games permission", async () => {
    const user = userEvent.setup();
    useUserStore.setState({
      user: buildUser({ permissions: [Permissions.ADMIN_GAMES_READ] }),
    });

    renderSidebar();
    const adminMenuItem = screen
      .getByRole("link", { name: "Admin" })
      .closest("li") as HTMLElement;
    await user.click(
      within(adminMenuItem).getByRole("button", { name: "Toggle" })
    );

    expect(
      within(adminMenuItem).getByRole("link", { name: "Games" })
    ).toHaveAttribute("href", routerConfig.adminGames.path);
  });

  it("shows a Feature Flags sub-item under Admin only with the feature-flag manage permission", async () => {
    const user = userEvent.setup();
    useUserStore.setState({
      user: buildUser({
        permissions: [Permissions.ADMIN_FEATURE_FLAGS_MANAGE],
      }),
    });

    renderSidebar();
    const adminMenuItem = screen
      .getByRole("link", { name: "Admin" })
      .closest("li") as HTMLElement;
    await user.click(
      within(adminMenuItem).getByRole("button", { name: "Toggle" })
    );

    expect(
      within(adminMenuItem).getByRole("link", { name: "Feature Flags" })
    ).toHaveAttribute("href", routerConfig.adminFeatureFlags.path);
  });

  it("shows an Audit Log sub-item under Admin only with the audit log read permission", async () => {
    const user = userEvent.setup();
    useUserStore.setState({
      user: buildUser({
        permissions: [Permissions.ADMIN_AUDIT_LOG_READ],
      }),
    });

    renderSidebar();
    const adminMenuItem = screen
      .getByRole("link", { name: "Admin" })
      .closest("li") as HTMLElement;
    await user.click(
      within(adminMenuItem).getByRole("button", { name: "Toggle" })
    );

    expect(
      within(adminMenuItem).getByRole("link", { name: "Audit Log" })
    ).toHaveAttribute("href", routerConfig.adminAuditLog.path);
  });

  it("shows the tenant logo linking to the dashboard", () => {
    renderSidebar();

    const images = screen.getAllByAltText("Algowars");
    expect(images[0].closest("a")).toHaveAttribute(
      "href",
      routerConfig.dashboard.path
    );
  });
});

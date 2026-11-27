import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TopBanner from "./top-banner";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { useAccount } from "@/domains/user/api/get-account";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { routerConfig } from "@/shared/router-config";
import { usePathname } from "@/test/mocks/next-navigation";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/user/api/get-account");
vi.mock("@/domains/user/components/setup-banner", () => ({
  SetupBannerContent: () => <div>setup-banner</div>,
}));

const mockUseAccount = vi.mocked(useAccount);
const mockUsePathname = vi.mocked(usePathname);

describe("TopBanner", () => {
  beforeEach(() => {
    resetUserStore();
    document.documentElement.style.removeProperty("--active-banner-offset");
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseAccount.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useAccount>);
  });

  it("renders nothing for an unauthenticated visitor", () => {
    const { container } = render(<TopBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the setup banner when the account setup is incomplete", () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    mockUseAccount.mockReturnValue({
      data: buildUser({ setupCompletedAt: undefined }),
    } as unknown as ReturnType<typeof useAccount>);

    render(<TopBanner />);

    expect(screen.getByText("setup-banner")).toBeVisible();
  });

  it.each([
    ["the user setup page itself", routerConfig.userSetup.path],
    ["the problems list", routerConfig.problems.path],
    ["the games list", routerConfig.games.path],
    ["a game in progress", "/game/play/game-1"],
    ["the landing page", routerConfig.home.path],
  ])("hides the setup banner on %s", (_description, path) => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    mockUsePathname.mockReturnValue(path);
    mockUseAccount.mockReturnValue({
      data: buildUser({ setupCompletedAt: undefined }),
    } as unknown as ReturnType<typeof useAccount>);

    const { container } = render(<TopBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it("leaves the banner offset at zero on a screen that hides the banner", () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    mockUsePathname.mockReturnValue(routerConfig.problems.path);
    mockUseAccount.mockReturnValue({
      data: buildUser({ setupCompletedAt: undefined }),
    } as unknown as ReturnType<typeof useAccount>);

    render(<TopBanner />);

    expect(
      document.documentElement.style.getPropertyValue("--active-banner-offset")
    ).toBe("0px");
  });

  it("does not show the setup banner once setup is complete", () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    mockUseAccount.mockReturnValue({
      data: buildUser({ setupCompletedAt: new Date() }),
    } as unknown as ReturnType<typeof useAccount>);

    const { container } = render(<TopBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it("sets the active-banner-offset CSS variable while the setup banner is visible", () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    mockUseAccount.mockReturnValue({
      data: buildUser({ setupCompletedAt: undefined }),
    } as unknown as ReturnType<typeof useAccount>);

    render(<TopBanner />);

    expect(
      document.documentElement.style.getPropertyValue("--active-banner-offset")
    ).toBe("2.5rem");
  });
});

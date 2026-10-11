import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SidebarUser from "./sidebar-user";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { routerConfig } from "@/shared/router-config";
import { useUser } from "@auth0/nextjs-auth0";
import { retrySyncMock } from "@/test/mocks/use-user-sync";
import { usePathname } from "@/test/mocks/next-navigation";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockUseUser = vi.mocked(useUser);

function renderSidebarUser() {
  return render(
    <SidebarProvider>
      <SidebarUser />
    </SidebarProvider>
  );
}

describe("SidebarUser", () => {
  beforeEach(() => {
    resetUserStore();
    retrySyncMock.mockClear();
    usePathname.mockReturnValue("/");
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
  });

  it("shows a loading skeleton while the auth profile is loading", () => {
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: true,
      error: undefined,
      invalidate: vi.fn(),
    });

    renderSidebarUser();

    expect(screen.getByRole("button", { hidden: true })).toBeDisabled();
  });

  it("shows a join prompt when there is no authenticated user", () => {
    renderSidebarUser();

    expect(screen.getByText("Join the algowars community")).toBeVisible();
    expect(screen.getByRole("link", { name: "Log In" })).toHaveAttribute(
      "href",
      routerConfig.authLogIn.path
    );
    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
      "href",
      routerConfig.authSignUp.path
    );
  });

  it("shows the display name and profile links for an authenticated user", async () => {
    mockUseUser.mockReturnValue({
      user: buildAuthUser(),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });
    useUserStore.setState({ user: buildUser({ username: "testuser" }) });

    const user = userEvent.setup();
    renderSidebarUser();

    expect(screen.getByText("testuser")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /testuser/ }));

    expect(screen.getByRole("menuitem", { name: /Profile/ })).toHaveAttribute(
      "href",
      routerConfig.profile.execute({ username: "testuser" })
    );
    expect(screen.getByRole("menuitem", { name: /Settings/ })).toHaveAttribute(
      "href",
      routerConfig.profileSettings.path
    );
  });

  it("shows an admin label for admins in the dropdown", async () => {
    mockUseUser.mockReturnValue({
      user: buildAuthUser(),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });
    useUserStore.setState({
      user: buildUser({ username: "adminuser", roles: ["admin"] }),
    });

    const user = userEvent.setup();
    renderSidebarUser();

    await user.click(screen.getByRole("button", { name: /adminuser/ }));

    expect(screen.getByText("Admin")).toBeVisible();
  });

  it("shows a retry option and calls retrySync when the profile failed to sync", async () => {
    mockUseUser.mockReturnValue({
      user: buildAuthUser(),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: null,
      userError: "sync failed",
    });

    const user = userEvent.setup();
    renderSidebarUser();

    expect(screen.getByText("Profile unavailable")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Test User/ }));
    await user.click(
      screen.getByRole("menuitem", { name: "Retry loading profile" })
    );

    expect(retrySyncMock).toHaveBeenCalledTimes(1);
  });

  it("sends the signed-out log in link back to the current page", () => {
    usePathname.mockReturnValue("/problems/two-sum");

    renderSidebarUser();

    expect(screen.getByRole("link", { name: "Log In" })).toHaveAttribute(
      "href",
      "/auth/login?returnTo=%2Fproblems%2Ftwo-sum"
    );
  });

  it("shows the signed-out card for an expired session even though the Auth0 cookie still resolves", () => {
    mockUseUser.mockReturnValue({
      user: buildAuthUser(),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });
    usePathname.mockReturnValue("/problems/two-sum");
    useUserStore.getState().sessionExpired();

    renderSidebarUser();

    expect(screen.getByText("Your session expired")).toBeVisible();
    expect(
      screen.getByText("Sign in again to pick up where you left off.")
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Log In" })).toHaveAttribute(
      "href",
      "/auth/login?returnTo=%2Fproblems%2Ftwo-sum"
    );
    // Nothing to retry and nothing to sign up for — the account already exists.
    expect(screen.queryByText("Profile unavailable")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign Up" })
    ).not.toBeInTheDocument();
  });

  it("keeps the signed-in menu when the profile merely failed to load", async () => {
    mockUseUser.mockReturnValue({
      user: buildAuthUser(),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: null,
      userError: "account down",
      isSessionExpired: false,
    });

    renderSidebarUser();

    expect(screen.getByText("Profile unavailable")).toBeVisible();
    expect(screen.queryByText("Your session expired")).not.toBeInTheDocument();
  });
});

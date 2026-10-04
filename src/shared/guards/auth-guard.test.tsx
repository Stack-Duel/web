import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthGuard } from "./auth-guard";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

describe("AuthGuard", () => {
  beforeEach(() => {
    resetUserStore();
  });

  it("renders the loading fallback while the auth/user state is still loading", () => {
    useUserStore.setState({ isAuthLoading: true });

    render(
      <AuthGuard loadingFallback={<p>Loading...</p>}>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Loading...")).toBeVisible();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the default unauthenticated fallback when there is no auth profile", () => {
    render(
      <AuthGuard>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Sign in to view this content.")).toBeVisible();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders a custom fallback when provided and the user is unauthenticated", () => {
    render(
      <AuthGuard fallback={<p>Custom fallback</p>}>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Custom fallback")).toBeVisible();
  });

  it("renders nothing when fallback is explicitly null and the user is unauthenticated", () => {
    const { container } = render(
      <AuthGuard fallback={null}>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByText("Sign in to view this content.")
    ).not.toBeInTheDocument();
  });

  it("renders the children when the user is authenticated and no permission is required", () => {
    useUserStore.setState({ authProfile: buildAuthUser() });

    render(
      <AuthGuard>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Protected content")).toBeVisible();
  });

  it("renders the forbidden fallback when the user is missing a required permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(
      <AuthGuard permission={Permissions.ADMIN_USERS_READ}>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(
      screen.getByText("You don't have permission to view this.")
    ).toBeVisible();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the children when the user has the single required permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_USERS_READ] }),
    });

    render(
      <AuthGuard permission={Permissions.ADMIN_USERS_READ}>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Protected content")).toBeVisible();
  });

  it("requires every permission when requireAll is true", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_USERS_READ] }),
    });

    render(
      <AuthGuard
        permission={[
          Permissions.ADMIN_USERS_READ,
          Permissions.ADMIN_USER_GROUPS_UPDATE,
        ]}
        requireAll
      >
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(
      screen.getByText("You don't have permission to view this.")
    ).toBeVisible();
  });

  it("only requires one permission when requireAll is false", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_USERS_READ] }),
    });

    render(
      <AuthGuard
        permission={[
          Permissions.ADMIN_USERS_READ,
          Permissions.ADMIN_USER_GROUPS_UPDATE,
        ]}
        requireAll={false}
      >
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Protected content")).toBeVisible();
  });
});

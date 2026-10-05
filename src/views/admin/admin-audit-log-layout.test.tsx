import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminAuditLogLayout from "./admin-audit-log-layout";
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
vi.mock("@/domains/audit-log/tables/admin-audit-log-table", () => ({
  default: () => <div>admin-audit-log-table</div>,
}));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminAuditLogLayout", () => {
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

  it("shows the table to a user with audit log read access", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_AUDIT_LOG_READ] }),
    });

    render(<AdminAuditLogLayout />);

    expect(screen.getByText("admin-audit-log-table")).toBeVisible();
  });

  it("hides the table behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(<AdminAuditLogLayout />);

    expect(screen.getByText("Page not found")).toBeVisible();
    expect(screen.queryByText("admin-audit-log-table")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "breadcrumb" })
    ).not.toBeInTheDocument();
  });

  it("shows the Admin > Audit Log breadcrumb, with Admin linking back to the dashboard", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_AUDIT_LOG_READ] }),
    });

    render(<AdminAuditLogLayout />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByRole("link", { name: "Admin" })).toHaveAttribute(
      "href",
      "/admin"
    );
    expect(breadcrumb.getByText("Audit Log")).toBeVisible();
  });
});

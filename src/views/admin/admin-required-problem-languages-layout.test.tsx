import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminRequiredProblemLanguagesLayout from "./admin-required-problem-languages-layout";
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
vi.mock("@/domains/problem/tables/required-problem-languages-table", () => ({
  default: () => <div>required-problem-languages-table</div>,
}));
vi.mock("@/domains/problem/components/add-required-language-dialog", () => ({
  default: () => <div>add-required-language-dialog</div>,
}));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminRequiredProblemLanguagesLayout", () => {
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

  it("shows the table and add-language dialog to a user with manage access", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({
        permissions: [Permissions.ADMIN_REQUIRED_LANGUAGES_MANAGE],
      }),
    });

    render(<AdminRequiredProblemLanguagesLayout />);

    expect(screen.getByText("required-problem-languages-table")).toBeVisible();
    expect(screen.getByText("add-required-language-dialog")).toBeVisible();
  });

  it("hides the content behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(<AdminRequiredProblemLanguagesLayout />);

    expect(screen.getByText("Page not found")).toBeVisible();
    expect(
      screen.queryByText("required-problem-languages-table")
    ).not.toBeInTheDocument();
  });

  it("shows the Admin > Required Languages breadcrumb", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({
        permissions: [Permissions.ADMIN_REQUIRED_LANGUAGES_MANAGE],
      }),
    });

    render(<AdminRequiredProblemLanguagesLayout />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByText("Admin")).toBeVisible();
    expect(breadcrumb.getByText("Required Languages")).toBeVisible();
  });
});

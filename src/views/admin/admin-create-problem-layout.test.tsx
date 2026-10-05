import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminCreateProblemLayout from "./admin-create-problem-layout";
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
vi.mock("@/domains/problem/forms/create-problem-form", () => ({
  default: () => <div>create-problem-form</div>,
}));
vi.mock("@/domains/problem/components/upload-problem-info-json-button", () => ({
  default: () => <div>upload-problem-info-json-button</div>,
}));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminCreateProblemLayout", () => {
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

  it("shows the create form to a user with create access", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_PROBLEMS_CREATE] }),
    });

    render(<AdminCreateProblemLayout />);

    expect(screen.getByText("create-problem-form")).toBeVisible();
  });

  it("hides the form behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(<AdminCreateProblemLayout />);

    expect(screen.getByText("Page not found")).toBeVisible();
    expect(screen.queryByText("create-problem-form")).not.toBeInTheDocument();
  });

  it("shows the Admin > Problems > New breadcrumb", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.ADMIN_PROBLEMS_CREATE] }),
    });

    render(<AdminCreateProblemLayout />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByText("Admin")).toBeVisible();
    expect(breadcrumb.getByText("Problems")).toBeVisible();
    expect(breadcrumb.getByText("New")).toBeVisible();
  });
});

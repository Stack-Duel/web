import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminProblemPoolsLayout from "./admin-problem-pools-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useUser } from "@auth0/nextjs-auth0";
import { useProblemPools } from "@/domains/problem/api/get-problem-pools";
import { buildProblemPool } from "@/test/factories/problem";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/problem/api/get-problem-pools");
vi.mock("@/domains/problem/components/create-problem-pool-form", () => ({
  default: () => <div>create-problem-pool-form</div>,
}));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseProblemPools = vi.mocked(useProblemPools);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminProblemPoolsLayout", () => {
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
      user: buildUser({ permissions: [Permissions.ADMIN_PROBLEMS_READ] }),
    });
    mockUseProblemPools.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPools>);
  });

  it("hides the content behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(<AdminProblemPoolsLayout />);

    expect(screen.getByText("Page not found")).toBeVisible();
  });

  it("shows a message when there are no pools yet", () => {
    render(<AdminProblemPoolsLayout />);

    expect(
      screen.getByText("No problem pools exist yet. Create one below.")
    ).toBeVisible();
    expect(screen.getByText("create-problem-pool-form")).toBeVisible();
  });

  it("lists each pool as a link to its detail page", () => {
    mockUseProblemPools.mockReturnValue({
      data: [
        buildProblemPool({ key: "daily", name: "Daily", problemCount: 3 }),
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPools>);

    render(<AdminProblemPoolsLayout />);

    const link = screen.getByRole("link", { name: /Daily/ });
    expect(link).toHaveAttribute("href", "/admin/problems/pools/daily");
    expect(screen.getByText("3 problems")).toBeVisible();
  });

  it("shows the Admin > Problems > Pools breadcrumb", () => {
    render(<AdminProblemPoolsLayout />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByText("Admin")).toBeVisible();
    expect(breadcrumb.getByText("Problems")).toBeVisible();
    expect(breadcrumb.getByText("Pools")).toBeVisible();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen } from "@testing-library/react";
import AdminProblemPoolDetailLayout from "./admin-problem-pool-detail-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useUser } from "@auth0/nextjs-auth0";
import { useProblemPools } from "@/domains/problem/api/get-problem-pools";
import { useProblemPoolMemberIds } from "@/domains/problem/api/get-problem-pool-member-ids";
import { useProblemPoolMembers } from "@/domains/problem/api/get-problem-pool-members";
import { useAdminProblems } from "@/domains/problem/api/get-admin-problems";
import { useAddProblemsToPool } from "@/domains/problem/api/add-problems-to-pool";
import { useRemoveProblemFromPool } from "@/domains/problem/api/remove-problem-from-pool";
import { useOrderedProblemPoolMembers } from "@/domains/problem/api/get-ordered-problem-pool-members";
import { useReorderProblemPool } from "@/domains/problem/api/reorder-problem-pool";
import {
  buildAdminProblemListItem,
  buildProblemPool,
} from "@/test/factories/problem";

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
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/domains/problem/api/get-problem-pools");
vi.mock("@/domains/problem/api/get-problem-pool-member-ids");
vi.mock("@/domains/problem/api/get-problem-pool-members");
vi.mock("@/domains/problem/api/get-admin-problems");
vi.mock("@/domains/problem/api/add-problems-to-pool");
vi.mock("@/domains/problem/api/remove-problem-from-pool");
vi.mock("@/domains/problem/api/get-ordered-problem-pool-members");
vi.mock("@/domains/problem/api/reorder-problem-pool");
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseProblemPools = vi.mocked(useProblemPools);
const mockUseProblemPoolMemberIds = vi.mocked(useProblemPoolMemberIds);
const mockUseProblemPoolMembers = vi.mocked(useProblemPoolMembers);
const mockUseAdminProblems = vi.mocked(useAdminProblems);
const mockUseAddProblemsToPool = vi.mocked(useAddProblemsToPool);
const mockUseRemoveProblemFromPool = vi.mocked(useRemoveProblemFromPool);
const mockUseOrderedProblemPoolMembers = vi.mocked(
  useOrderedProblemPoolMembers
);
const mockUseReorderProblemPool = vi.mocked(useReorderProblemPool);

const addProblemsMock = vi.fn();
const removeFromPoolMock = vi.fn();

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminProblemPoolDetailLayout", () => {
  beforeEach(() => {
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
    vi.clearAllMocks();
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
      data: [buildProblemPool({ key: "daily", name: "Daily challenge" })],
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPools>);
    mockUseProblemPoolMemberIds.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPoolMemberIds>);
    mockUseProblemPoolMembers.mockReturnValue({
      data: { results: [], total: 0, page: 1, size: 20 },
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPoolMembers>);
    mockUseAdminProblems.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);
    mockUseAddProblemsToPool.mockReturnValue({
      mutateAsync: addProblemsMock,
      isPending: false,
    } as unknown as ReturnType<typeof useAddProblemsToPool>);
    mockUseRemoveProblemFromPool.mockReturnValue({
      mutate: removeFromPoolMock,
      isPending: false,
    } as unknown as ReturnType<typeof useRemoveProblemFromPool>);
    mockUseOrderedProblemPoolMembers.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useOrderedProblemPoolMembers>);
    mockUseReorderProblemPool.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReorderProblemPool>);
  });

  it("hides the content behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(<AdminProblemPoolDetailLayout poolKey="daily" />);

    expect(screen.getByText("Page not found")).toBeVisible();
  });

  it("shows a not-found message when the pool key doesn't match a loaded pool", () => {
    mockUseProblemPools.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPools>);

    render(<AdminProblemPoolDetailLayout poolKey="daily" />);

    expect(screen.getByText("Pool not found.")).toBeVisible();
  });

  it("shows the pool name, member count, and current members", () => {
    mockUseProblemPoolMemberIds.mockReturnValue({
      data: ["p1"],
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPoolMemberIds>);
    mockUseProblemPoolMembers.mockReturnValue({
      data: {
        results: [buildAdminProblemListItem({ id: "p1", title: "Two Sum" })],
        total: 1,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPoolMembers>);

    render(<AdminProblemPoolDetailLayout poolKey="daily" />);

    expect(screen.getByText("Daily challenge")).toBeVisible();
    expect(screen.getByText("Problems in this pool (1)")).toBeVisible();
    expect(screen.getByText("Two Sum")).toBeVisible();
  });

  it("excludes existing members from the addable list", () => {
    mockUseProblemPoolMemberIds.mockReturnValue({
      data: ["p1"],
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPoolMemberIds>);
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [
          buildAdminProblemListItem({ id: "p1", title: "Two Sum" }),
          buildAdminProblemListItem({ id: "p2", title: "Reverse String" }),
        ],
        total: 2,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);

    render(<AdminProblemPoolDetailLayout poolKey="daily" />);

    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
    expect(screen.getByText("Reverse String")).toBeVisible();
  });
});

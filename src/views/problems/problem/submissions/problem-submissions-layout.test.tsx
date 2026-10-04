import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import ProblemSubmissionsLayout from "./problem-submissions-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useUser } from "@auth0/nextjs-auth0";
import { routerConfig } from "@/shared/router-config";
import type { Problem } from "@/domains/problem/models/problem";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock(
  "@/domains/problem/problem-submissions/components/problem-submissions-filter",
  () => ({ default: () => <div>problem-submissions-filter</div> })
);
vi.mock(
  "@/domains/problem/problem-submissions/components/problem-submissions-header",
  () => ({ default: () => <div>problem-submissions-header</div> })
);
vi.mock(
  "@/domains/problem/problem-submissions/components/problem-submissions",
  () => ({ default: () => <div>problem-submissions</div> })
);
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

const problem: Problem = {
  id: "p1",
  slug: "two-sum",
  title: "Two Sum",
  difficultyTier: "Easy",
  question: "",
  availableLanguages: [],
  publicTestCases: [],
};

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("ProblemSubmissionsLayout", () => {
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

  it("shows the submissions list to a user with view permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.SUBMISSION_VIEW] }),
    });

    render(
      <ProblemSubmissionsLayout problem={problem} isAuthenticated={true} />
    );

    expect(screen.getByText("problem-submissions")).toBeVisible();
    expect(screen.getByText("problem-submissions-header")).toBeVisible();
    expect(screen.getByText("problem-submissions-filter")).toBeVisible();
  });

  it("shows the unauthenticated fallback for a guest without permission", () => {
    render(
      <ProblemSubmissionsLayout problem={problem} isAuthenticated={false} />
    );

    expect(screen.getByText("Sign in to view this content.")).toBeVisible();
    expect(screen.queryByText("problem-submissions")).not.toBeInTheDocument();
  });

  it("shows the forbidden fallback for an authenticated user without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    render(
      <ProblemSubmissionsLayout problem={problem} isAuthenticated={true} />
    );

    expect(
      screen.getByText("You don't have permission to view this.")
    ).toBeVisible();
  });

  it("shows the problem slug and Submissions breadcrumb", () => {
    render(
      <ProblemSubmissionsLayout problem={problem} isAuthenticated={false} />
    );

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByRole("link", { name: "two-sum" })).toHaveAttribute(
      "href",
      routerConfig.problem.execute({ slug: "two-sum" })
    );
    expect(breadcrumb.getByText("Submissions")).toBeVisible();
  });
});

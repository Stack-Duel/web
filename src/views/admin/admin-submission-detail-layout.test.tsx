import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminSubmissionDetailLayout from "./admin-submission-detail-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useUser } from "@auth0/nextjs-auth0";
import { useAdminSubmissionDetail } from "@/domains/submission/api/get-admin-submission-detail";
import type { AdminSubmissionDetail } from "@/domains/submission/models/admin-submission";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/domains/submission/api/get-admin-submission-detail");
vi.mock(
  "@/domains/submission/components/admin-submission-summary-panel",
  () => ({
    default: () => <div>admin-submission-summary-panel</div>,
  })
);
vi.mock(
  "@/domains/submission/components/admin-submission-pipeline-view",
  () => ({
    default: () => <div>admin-submission-pipeline-view</div>,
  })
);
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseAdminSubmissionDetail = vi.mocked(useAdminSubmissionDetail);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminSubmissionDetailLayout", () => {
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
      user: buildUser({ permissions: [Permissions.ADMIN_SUBMISSIONS_READ] }),
    });
  });

  it("shows a loading state while the submission detail is loading", () => {
    mockUseAdminSubmissionDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useAdminSubmissionDetail>);

    render(<AdminSubmissionDetailLayout id="sub1" />);

    expect(screen.getByText("Loading...")).toBeVisible();
  });

  it("shows a not-found message when the submission fails to load", () => {
    mockUseAdminSubmissionDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("not found"),
    } as unknown as ReturnType<typeof useAdminSubmissionDetail>);

    render(<AdminSubmissionDetailLayout id="sub1" />);

    expect(screen.getByText("Submission not found.")).toBeVisible();
  });

  it("shows the summary panel and pipeline view once loaded", () => {
    mockUseAdminSubmissionDetail.mockReturnValue({
      data: { id: "sub1", job: null } as unknown as AdminSubmissionDetail,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminSubmissionDetail>);

    render(<AdminSubmissionDetailLayout id="sub1" />);

    expect(screen.getByText("admin-submission-summary-panel")).toBeVisible();
    expect(screen.getByText("admin-submission-pipeline-view")).toBeVisible();
  });

  it("hides the content behind the auth guard fallback without permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });
    mockUseAdminSubmissionDetail.mockReturnValue({
      data: { id: "sub1", job: null } as unknown as AdminSubmissionDetail,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminSubmissionDetail>);

    render(<AdminSubmissionDetailLayout id="sub1" />);

    expect(screen.getByText("Page not found")).toBeVisible();
    expect(
      screen.queryByRole("navigation", { name: "breadcrumb" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("admin-submission-summary-panel")
    ).not.toBeInTheDocument();
  });

  it("shows the Admin > Submissions > id breadcrumb", () => {
    mockUseAdminSubmissionDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useAdminSubmissionDetail>);

    render(<AdminSubmissionDetailLayout id="sub1" />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByText("Admin")).toBeVisible();
    expect(breadcrumb.getByText("Submissions")).toBeVisible();
    expect(breadcrumb.getByText("sub1")).toBeVisible();
  });
});

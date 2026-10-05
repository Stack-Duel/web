import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen, within } from "@testing-library/react";
import AdminProblemDetailLayout from "./admin-problem-detail-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useUser } from "@auth0/nextjs-auth0";
import { useAdminProblemDetail } from "@/domains/problem/api/get-admin-problem-detail";
import type { AdminProblemDetail } from "@/domains/problem/models/admin-problem";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/problem/api/get-admin-problem-detail");
vi.mock("@/domains/problem/components/difficulty-badge", () => ({
  default: () => <span>difficulty-badge</span>,
}));
vi.mock("@/domains/problem/components/admin-problem-status-badge", () => ({
  default: () => <span>status-badge</span>,
}));
vi.mock("@/domains/problem/components/admin-problem-setups-list", () => ({
  default: () => <div>admin-problem-setups-list</div>,
}));
vi.mock("@/domains/problem/forms/edit-problem-form", () => ({
  default: () => <div>edit-problem-form</div>,
}));
vi.mock("@/domains/problem/components/admin-problem-pools", () => ({
  default: () => <div>admin-problem-pools</div>,
}));
vi.mock(
  "@/domains/problem/components/add-problem-setup-language-dialog",
  () => ({
    default: () => <div>add-problem-setup-language-dialog</div>,
  })
);
vi.mock("@/domains/problem/components/upload-setups-json-button", () => ({
  default: () => <div>upload-setups-json-button</div>,
}));
vi.mock(
  "@/domains/problem/components/upload-sample-test-cases-json-button",
  () => ({
    default: () => <div>upload-sample-test-cases-json-button</div>,
  })
);
vi.mock(
  "@/domains/problem/components/upload-generation-parameters-json-button",
  () => ({
    default: () => <div>upload-generation-parameters-json-button</div>,
  })
);
vi.mock("@/domains/problem/components/admin-problem-pending-banner", () => ({
  default: () => <div>admin-problem-pending-banner</div>,
}));
vi.mock(
  "@/domains/problem/components/admin-problem-validation-failure-alert",
  () => ({
    default: () => <div>admin-problem-validation-failure-alert</div>,
  })
);
vi.mock("@/domains/problem/components/submit-for-validation-button", () => ({
  default: () => <div>submit-for-validation-button</div>,
}));
vi.mock("@/domains/problem/components/sample-test-case-editor", () => ({
  default: () => <div>sample-test-case-editor</div>,
}));
vi.mock("@/domains/problem/components/generation-parameters-editor", () => ({
  default: () => <div>generation-parameters-editor</div>,
}));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseAdminProblemDetail = vi.mocked(useAdminProblemDetail);

function grantPermissions(
  ...permissions: (typeof Permissions)[keyof typeof Permissions][]
) {
  useUserStore.setState({
    authProfile: buildAuthUser(),
    user: buildUser({ permissions }),
  });
}

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("AdminProblemDetailLayout", () => {
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
    grantPermissions(Permissions.ADMIN_PROBLEMS_READ);
  });

  it("shows a loading state while the problem detail is loading", () => {
    mockUseAdminProblemDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    expect(screen.getByText("Loading...")).toBeVisible();
  });

  it("shows a not-found message when the problem fails to load", () => {
    mockUseAdminProblemDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("not found"),
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    expect(screen.getByText("Problem not found.")).toBeVisible();
  });

  it("shows the problem's title, slug, and setups once loaded", () => {
    mockUseAdminProblemDetail.mockReturnValue({
      data: {
        id: "p1",
        slug: "two-sum",
        title: "Two Sum",
        difficultyTier: "Easy",
        status: "Published",
        setups: [],
      } as unknown as AdminProblemDetail,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    expect(screen.getByText("two-sum")).toBeVisible();
    expect(screen.getByText("Two Sum")).toBeVisible();
    expect(screen.getByText("admin-problem-setups-list")).toBeVisible();
  });

  it("shows the created-by badge when present", () => {
    mockUseAdminProblemDetail.mockReturnValue({
      data: {
        id: "p1",
        slug: "two-sum",
        title: "Two Sum",
        difficultyTier: "Easy",
        status: "Published",
        createdByUsername: "algouser",
        setups: [],
      } as unknown as AdminProblemDetail,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    expect(screen.getByText("by algouser")).toBeVisible();
  });

  it("hides the edit form behind the auth guard without update permission", () => {
    mockUseAdminProblemDetail.mockReturnValue({
      data: {
        id: "p1",
        slug: "two-sum",
        title: "Two Sum",
        difficultyTier: "Easy",
        status: "Published",
        setups: [],
      } as unknown as AdminProblemDetail,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    expect(screen.queryByText("edit-problem-form")).not.toBeInTheDocument();
    expect(screen.getByText("This page could not be found.")).toBeVisible();
  });

  it("shows the edit form with update permission", () => {
    grantPermissions(
      Permissions.ADMIN_PROBLEMS_READ,
      Permissions.ADMIN_PROBLEMS_UPDATE
    );
    mockUseAdminProblemDetail.mockReturnValue({
      data: {
        id: "p1",
        slug: "two-sum",
        title: "Two Sum",
        difficultyTier: "Easy",
        status: "Published",
        setups: [],
      } as unknown as AdminProblemDetail,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    expect(screen.getByText("edit-problem-form")).toBeVisible();
  });

  it("shows the pending banner and hides editing while validation is in progress", () => {
    mockUseAdminProblemDetail.mockReturnValue({
      data: {
        id: "p1",
        slug: "two-sum",
        title: "Two Sum",
        difficultyTier: "Easy",
        status: "Pending",
        setups: [],
      } as unknown as AdminProblemDetail,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    expect(screen.getByText("admin-problem-pending-banner")).toBeVisible();
    expect(
      screen.queryByText("add-problem-setup-language-dialog")
    ).not.toBeInTheDocument();
  });

  it("shows the validation failure alert and submit button for a failed problem", () => {
    grantPermissions(
      Permissions.ADMIN_PROBLEMS_READ,
      Permissions.ADMIN_PROBLEMS_SUBMIT
    );
    mockUseAdminProblemDetail.mockReturnValue({
      data: {
        id: "p1",
        slug: "two-sum",
        title: "Two Sum",
        difficultyTier: "Easy",
        status: "Failed",
        validationFailureReason: "Bad reference solution.",
        setups: [],
      } as unknown as AdminProblemDetail,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    expect(
      screen.getByText("admin-problem-validation-failure-alert")
    ).toBeVisible();
    expect(screen.getByText("submit-for-validation-button")).toBeVisible();
  });

  it("shows the add-language dialog and sample/generation cards with create access", () => {
    grantPermissions(
      Permissions.ADMIN_PROBLEMS_READ,
      Permissions.ADMIN_PROBLEMS_CREATE
    );
    mockUseAdminProblemDetail.mockReturnValue({
      data: {
        id: "p1",
        slug: "two-sum",
        title: "Two Sum",
        difficultyTier: "Easy",
        status: "Draft",
        setups: [],
      } as unknown as AdminProblemDetail,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    expect(screen.getByText("add-problem-setup-language-dialog")).toBeVisible();
    expect(screen.getByText("sample-test-case-editor")).toBeVisible();
    expect(screen.getByText("generation-parameters-editor")).toBeVisible();
  });

  it("shows the track badge when present", () => {
    mockUseAdminProblemDetail.mockReturnValue({
      data: {
        id: "p1",
        slug: "two-sum",
        title: "Two Sum",
        difficultyTier: "Easy",
        status: "Published",
        trackName: "General Purpose",
        setups: [],
      } as unknown as AdminProblemDetail,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    expect(screen.getByText("General Purpose")).toBeVisible();
  });

  it("shows the Admin > Problems > id breadcrumb", () => {
    mockUseAdminProblemDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useAdminProblemDetail>);

    render(<AdminProblemDetailLayout id="p1" />);

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    );
    expect(breadcrumb.getByText("Admin")).toBeVisible();
    expect(breadcrumb.getByText("Problems")).toBeVisible();
    expect(breadcrumb.getByText("p1")).toBeVisible();
  });
});

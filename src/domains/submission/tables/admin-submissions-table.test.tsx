import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminSubmissionsTable from "./admin-submissions-table";
import { useAdminSubmissions } from "../api/get-admin-submissions";
import { useAdminSubmissionListStore } from "../state/admin-submission-list-store";
import { buildAdminSubmissionListItem } from "@/test/factories/submission";
import { routerMock } from "@/test/mocks/next-navigation";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("../api/get-admin-submissions", () => ({
  useAdminSubmissions: vi.fn(),
}));

const mockedUseAdminSubmissions = vi.mocked(useAdminSubmissions);
const initialListState = useAdminSubmissionListStore.getState();

function mockData(
  overrides: Partial<ReturnType<typeof useAdminSubmissions>> = {}
) {
  mockedUseAdminSubmissions.mockReturnValue({
    data: undefined,
    isLoading: false,
    ...overrides,
  } as unknown as ReturnType<typeof useAdminSubmissions>);
}

describe("AdminSubmissionsTable", () => {
  beforeEach(() => {
    useAdminSubmissionListStore.setState(initialListState, true);
    routerMock.push.mockClear();
    mockData();
  });

  it("renders a row per submission with its status badge", () => {
    mockData({
      data: {
        results: [
          buildAdminSubmissionListItem({
            problemTitle: "Two Sum",
            status: "WrongAnswer",
          }),
        ],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    render(<AdminSubmissionsTable />);

    expect(screen.getByText("Two Sum")).toBeVisible();
    expect(screen.getByText("WrongAnswer")).toHaveClass("bg-destructive/10");
  });

  it("navigates to the submission detail page when a row is clicked", async () => {
    mockData({
      data: {
        results: [
          buildAdminSubmissionListItem({
            id: "11111111-1111-1111-1111-111111111111",
            problemTitle: "Two Sum",
          }),
        ],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    const user = userEvent.setup();
    render(<AdminSubmissionsTable />);

    await user.click(screen.getByText("Two Sum"));

    expect(routerMock.push).toHaveBeenCalledWith(
      "/admin/submissions/11111111-1111-1111-1111-111111111111"
    );
  });

  it("passes only a valid GUID search id through as a filter", () => {
    useAdminSubmissionListStore.setState({
      searchId: "11111111-1111-1111-1111-111111111111",
    });
    mockData();

    render(<AdminSubmissionsTable />);

    expect(mockedUseAdminSubmissions).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "11111111-1111-1111-1111-111111111111" })
    );
  });

  it("omits an invalid search id from the filter", () => {
    useAdminSubmissionListStore.setState({ searchId: "not-a-guid" });
    mockData();

    render(<AdminSubmissionsTable />);

    expect(mockedUseAdminSubmissions).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: undefined })
    );
  });

  it("resets the session on mount", () => {
    useAdminSubmissionListStore.setState({ pageIndex: 3 });

    render(<AdminSubmissionsTable />);

    expect(useAdminSubmissionListStore.getState().pageIndex).toBe(0);
  });
});

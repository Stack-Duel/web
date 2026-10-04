import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminProblemsTable from "./admin-problems-table";
import { useAdminProblems } from "../api/get-admin-problems";
import { useAdminProblemListStore } from "../state/admin-problem-list-store";
import { buildAdminProblemListItem } from "@/test/factories/problem";
import { routerMock } from "@/test/mocks/next-navigation";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("../api/get-admin-problems", () => ({
  useAdminProblems: vi.fn(),
}));

const mockedUseAdminProblems = vi.mocked(useAdminProblems);
const initialListState = useAdminProblemListStore.getState();

function mockData(
  overrides: Partial<ReturnType<typeof useAdminProblems>> = {}
) {
  mockedUseAdminProblems.mockReturnValue({
    data: undefined,
    isLoading: false,
    ...overrides,
  } as unknown as ReturnType<typeof useAdminProblems>);
}

describe("AdminProblemsTable", () => {
  beforeEach(() => {
    useAdminProblemListStore.setState(initialListState, true);
    routerMock.push.mockClear();
    mockData();
  });

  it("shows a loading skeleton while fetching", () => {
    mockData({ isLoading: true });

    render(<AdminProblemsTable />);

    expect(screen.queryByText("No results.")).not.toBeInTheDocument();
  });

  it("shows a no-results row when the page is empty", () => {
    mockData({
      data: { results: [], total: 0, page: 1, size: 20, timestamp: "t" },
    });

    render(<AdminProblemsTable />);

    expect(screen.getByText("No results.")).toBeVisible();
  });

  it("renders a row per problem", () => {
    mockData({
      data: {
        results: [
          buildAdminProblemListItem({ title: "Two Sum" }),
          buildAdminProblemListItem({ title: "Add Two Numbers" }),
        ],
        total: 2,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    render(<AdminProblemsTable />);

    expect(screen.getByText("Two Sum")).toBeVisible();
    expect(screen.getByText("Add Two Numbers")).toBeVisible();
  });

  it("navigates to the problem detail page when a row is clicked", async () => {
    mockData({
      data: {
        results: [
          buildAdminProblemListItem({ id: "problem_1", title: "Two Sum" }),
        ],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    const user = userEvent.setup();
    render(<AdminProblemsTable />);

    await user.click(screen.getByText("Two Sum"));

    expect(routerMock.push).toHaveBeenCalledWith("/admin/problems/problem_1");
  });

  it("resets the session on mount", () => {
    useAdminProblemListStore.setState({ pageIndex: 2 });

    render(<AdminProblemsTable />);

    expect(useAdminProblemListStore.getState().pageIndex).toBe(0);
  });
});

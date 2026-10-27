import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyProblemsTable from "./my-problems-table";
import { useMyProblems } from "../api/get-my-problems";
import { useMyProblemListStore } from "../state/my-problem-list-store";
import { buildMyProblemListItem } from "@/test/factories/problem";
import { routerMock } from "@/test/mocks/next-navigation";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("../api/get-my-problems", () => ({
  useMyProblems: vi.fn(),
}));

const mockedUseMyProblems = vi.mocked(useMyProblems);
const initialListState = useMyProblemListStore.getState();

function mockData(overrides: Partial<ReturnType<typeof useMyProblems>> = {}) {
  mockedUseMyProblems.mockReturnValue({
    data: undefined,
    isLoading: false,
    ...overrides,
  } as unknown as ReturnType<typeof useMyProblems>);
}

describe("MyProblemsTable", () => {
  beforeEach(() => {
    useMyProblemListStore.setState(initialListState, true);
    routerMock.push.mockClear();
    mockData();
  });

  it("shows a loading skeleton while fetching", () => {
    mockData({ isLoading: true });

    render(<MyProblemsTable />);

    expect(screen.queryByText("No results.")).not.toBeInTheDocument();
  });

  it("shows a no-results row when the page is empty", () => {
    mockData({
      data: { results: [], total: 0, page: 1, size: 20, timestamp: "t" },
    });

    render(<MyProblemsTable />);

    expect(screen.getByText("No results.")).toBeVisible();
  });

  it("renders a row per problem", () => {
    mockData({
      data: {
        results: [
          buildMyProblemListItem({ title: "Two Sum" }),
          buildMyProblemListItem({ title: "Add Two Numbers" }),
        ],
        total: 2,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    render(<MyProblemsTable />);

    expect(screen.getByText("Two Sum")).toBeVisible();
    expect(screen.getByText("Add Two Numbers")).toBeVisible();
  });

  it("navigates to the problem detail page when a row is clicked", async () => {
    mockData({
      data: {
        results: [
          buildMyProblemListItem({ id: "problem_1", title: "Two Sum" }),
        ],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    const user = userEvent.setup();
    render(<MyProblemsTable />);

    await user.click(screen.getByText("Two Sum"));

    expect(routerMock.push).toHaveBeenCalledWith("/studio/problems/problem_1");
  });

  it("resets the session on mount", () => {
    useMyProblemListStore.setState({ pageIndex: 2 });

    render(<MyProblemsTable />);

    expect(useMyProblemListStore.getState().pageIndex).toBe(0);
  });

  it("sends the selected statuses as a filter", () => {
    useMyProblemListStore.setState({ statusFilter: ["Draft", "Pending"] });

    render(<MyProblemsTable />);

    expect(mockedUseMyProblems).toHaveBeenCalledWith(
      expect.objectContaining({ statuses: ["Draft", "Pending"] })
    );
  });

  it("omits the statuses filter when no status is selected", () => {
    render(<MyProblemsTable />);

    expect(mockedUseMyProblems).toHaveBeenCalledWith(
      expect.objectContaining({ statuses: undefined })
    );
  });
});

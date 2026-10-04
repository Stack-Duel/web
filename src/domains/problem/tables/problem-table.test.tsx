import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProblemTable from "./problem-table";
import { useProblems } from "../api/use-problems";
import { useProblemListStore } from "../state/problem-list-store";
import { buildProblemSummary } from "@/test/factories/problem";
import { routerMock } from "@/test/mocks/next-navigation";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("../api/use-problems", () => ({
  useProblems: vi.fn(),
}));

const mockedUseProblems = vi.mocked(useProblems);
const initialListState = useProblemListStore.getState();

function mockData(overrides: Partial<ReturnType<typeof useProblems>> = {}) {
  mockedUseProblems.mockReturnValue({
    data: undefined,
    isLoading: false,
    ...overrides,
  } as unknown as ReturnType<typeof useProblems>);
}

describe("ProblemTable", () => {
  beforeEach(() => {
    useProblemListStore.setState(initialListState, true);
    routerMock.push.mockClear();
    mockData();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a row per problem with its tags joined", () => {
    mockData({
      data: {
        results: [
          buildProblemSummary({
            title: "Two Sum",
            tags: ["arrays", "hash-map"],
          }),
        ],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    render(<ProblemTable />);

    expect(screen.getByText("Two Sum")).toBeVisible();
    expect(screen.getByText("arrays, hash-map")).toBeVisible();
  });

  it("renders the name for each supported language", () => {
    mockData({
      data: {
        results: [
          buildProblemSummary({
            title: "Two Sum",
            languages: [
              { id: "lang_1", name: "JavaScript", slug: "javascript" },
              { id: "lang_2", name: "SQLite", slug: "sqlite" },
            ],
          }),
        ],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    render(<ProblemTable />);

    expect(screen.getByText("JavaScript,")).toBeVisible();
    expect(screen.getByText("SQLite")).toBeVisible();
    expect(screen.queryByText(/more$/)).not.toBeInTheDocument();
  });

  it("truncates languages beyond the visible count with a '+N more' label", () => {
    mockData({
      data: {
        results: [
          buildProblemSummary({
            title: "Two Sum",
            languages: [
              { id: "lang_1", name: "JavaScript", slug: "javascript" },
              { id: "lang_2", name: "TypeScript", slug: "typescript" },
              { id: "lang_3", name: "Python", slug: "python" },
              { id: "lang_4", name: "SQLite", slug: "sqlite" },
            ],
          }),
        ],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    render(<ProblemTable />);

    expect(screen.getByText("JavaScript,")).toBeVisible();
    expect(screen.getByText("TypeScript")).toBeVisible();
    expect(screen.queryByText("Python")).not.toBeInTheDocument();
    expect(screen.queryByText("SQLite")).not.toBeInTheDocument();
    expect(screen.getByText("+2 more")).toBeVisible();
  });

  it("navigates to the problem page when a row with a slug is clicked", async () => {
    mockData({
      data: {
        results: [
          buildProblemSummary({
            slug: "two-sum",
            title: "Two Sum",
            tags: ["arrays"],
          }),
        ],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    const user = userEvent.setup();
    render(<ProblemTable />);

    await user.click(screen.getByText("arrays"));

    expect(routerMock.push).toHaveBeenCalledWith("/problems/two-sum");
  });

  it("does not navigate when the row has no slug", async () => {
    mockData({
      data: {
        results: [
          buildProblemSummary({ slug: "", title: "Untitled", tags: ["misc"] }),
        ],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    const user = userEvent.setup();
    render(<ProblemTable />);

    await user.click(screen.getByText("misc"));

    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("renders the title as a link to the problem page", () => {
    mockData({
      data: {
        results: [buildProblemSummary({ slug: "two-sum", title: "Two Sum" })],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    render(<ProblemTable />);

    expect(screen.getByRole("link", { name: "Two Sum" })).toHaveAttribute(
      "href",
      "/problems/two-sum"
    );
  });

  it("hides the row selection summary and shows rows-per-page in its place", () => {
    mockData({
      data: {
        results: [buildProblemSummary({ title: "Two Sum" })],
        total: 1,
        page: 1,
        size: 20,
        timestamp: "t",
      },
    });

    render(<ProblemTable />);

    expect(screen.queryByText(/row\(s\) selected/)).not.toBeInTheDocument();
    expect(screen.getByText("Rows per page")).toBeVisible();
  });

  it("resets the session on mount", () => {
    useProblemListStore.setState({ pageIndex: 4 });

    render(<ProblemTable />);

    expect(useProblemListStore.getState().pageIndex).toBe(0);
  });

  it("debounces the search term before passing it to the query", () => {
    vi.useFakeTimers();

    render(<ProblemTable />);

    act(() => {
      useProblemListStore.getState().setSearch("two");
    });

    expect(mockedUseProblems).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: undefined })
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockedUseProblems).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: "two" })
    );
  });
});

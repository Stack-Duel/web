import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProblemSubmissions from "./problem-submissions";
import { ProblemSubmissionsFilterProvider } from "../state/problem-submissions-filter-store-context";
import { useProblemSubmissions } from "../api/use-problem-submissions";
import { buildProblem, buildProblemSubmission } from "@/test/factories/problem";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

vi.mock("../api/use-problem-submissions", () => ({
  useProblemSubmissions: vi.fn(),
}));
vi.mock(
  "@/shared/code-block/code-block",
  () => import("@/test/mocks/code-block")
);

const mockedUseProblemSubmissions = vi.mocked(useProblemSubmissions);

function renderList() {
  return render(
    <TooltipProvider>
      <ProblemSubmissionsFilterProvider>
        <ProblemSubmissions problem={buildProblem()} isAuthenticated />
      </ProblemSubmissionsFilterProvider>
    </TooltipProvider>
  );
}

describe("ProblemSubmissions", () => {
  it("shows an empty message when there is no data yet and not fetching", () => {
    mockedUseProblemSubmissions.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as unknown as ReturnType<typeof useProblemSubmissions>);

    renderList();

    expect(screen.getByText("No submissions found.")).toBeVisible();
  });

  it("flattens pages into a list of submission cards", () => {
    mockedUseProblemSubmissions.mockReturnValue({
      data: {
        pages: [
          {
            results: [
              buildProblemSubmission({
                id: "s1",
                user: { username: "alice", imageUrl: "" },
              }),
            ],
          },
          {
            results: [
              buildProblemSubmission({
                id: "s2",
                user: { username: "bob", imageUrl: "" },
              }),
            ],
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as unknown as ReturnType<typeof useProblemSubmissions>);

    renderList();

    expect(screen.getByText("alice")).toBeVisible();
    expect(screen.getByText("bob")).toBeVisible();
  });
});

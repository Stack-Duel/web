import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProblemSubmissionsFilter from "./problem-submissions-filter";
import { ProblemSubmissionsFilterProvider } from "../state/problem-submissions-filter-store-context";
import { useProblemSubmissions } from "../api/use-problem-submissions";

vi.mock("../api/use-problem-submissions", () => ({
  useProblemSubmissions: vi.fn(),
}));

const mockedUseProblemSubmissions = vi.mocked(useProblemSubmissions);

function renderFilter(
  props: Partial<ComponentProps<typeof ProblemSubmissionsFilter>> = {}
) {
  return render(
    <ProblemSubmissionsFilterProvider>
      <ProblemSubmissionsFilter slug="two-sum" isAuthenticated {...props} />
    </ProblemSubmissionsFilterProvider>
  );
}

describe("ProblemSubmissionsFilter", () => {
  beforeEach(() => {
    mockedUseProblemSubmissions.mockReturnValue({
      isLoading: false,
      isFetchingNextPage: false,
    } as unknown as ReturnType<typeof useProblemSubmissions>);
  });

  it("defaults to User Solutions sorted by Newest", () => {
    renderFilter();

    expect(screen.getByLabelText("User Solutions")).toBeChecked();
    expect(screen.getByLabelText("Newest")).toBeChecked();
  });

  it("switches the filter type when a radio option is clicked", async () => {
    const user = userEvent.setup();
    renderFilter();

    await user.click(screen.getByLabelText("My Submissions"));

    expect(screen.getByLabelText("My Submissions")).toBeChecked();
    expect(screen.getByLabelText("User Solutions")).not.toBeChecked();
  });

  it("switches the sort order when a radio option is clicked", async () => {
    const user = userEvent.setup();
    renderFilter();

    await user.click(screen.getByLabelText("Oldest"));

    expect(screen.getByLabelText("Oldest")).toBeChecked();
  });

  it("disables the radio options while loading", () => {
    mockedUseProblemSubmissions.mockReturnValue({
      isLoading: true,
      isFetchingNextPage: false,
    } as unknown as ReturnType<typeof useProblemSubmissions>);

    renderFilter();

    expect(screen.getByLabelText("User Solutions")).toBeDisabled();
    expect(screen.getByLabelText("Newest")).toBeDisabled();
  });

  it("disables the radio options when isDisabled is passed", () => {
    renderFilter({ isDisabled: true });

    expect(screen.getByLabelText("User Solutions")).toBeDisabled();
  });
});

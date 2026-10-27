import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyProblemStatusTabs from "./my-problem-status-tabs";
import { useMyProblemsMetadata } from "../api/get-my-problems-metadata";
import { useMyProblemListStore } from "../state/my-problem-list-store";
import { buildMyProblemsMetadata } from "@/test/factories/problem";

vi.mock("../api/get-my-problems-metadata", () => ({
  useMyProblemsMetadata: vi.fn(),
}));

const mockedUseMyProblemsMetadata = vi.mocked(useMyProblemsMetadata);
const initialListState = useMyProblemListStore.getState();

function mockMetadata(
  overrides: Partial<ReturnType<typeof useMyProblemsMetadata>> = {}
) {
  mockedUseMyProblemsMetadata.mockReturnValue({
    data: undefined,
    isLoading: false,
    ...overrides,
  } as unknown as ReturnType<typeof useMyProblemsMetadata>);
}

describe("MyProblemStatusTabs", () => {
  beforeEach(() => {
    useMyProblemListStore.setState(initialListState, true);
    mockMetadata();
  });

  it("shows All as selected by default", () => {
    render(<MyProblemStatusTabs />);

    expect(screen.getByRole("button", { name: /^all/i })).toHaveAttribute(
      "data-variant",
      "default"
    );
  });

  it("shows the count for each status from the metadata breakdown", () => {
    mockMetadata({
      data: buildMyProblemsMetadata({
        statusBreakdown: [
          { status: "Draft", count: 3 },
          { status: "Published", count: 1 },
        ],
      }),
    });

    render(<MyProblemStatusTabs />);

    expect(screen.getByRole("button", { name: "Draft (3)" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Published (1)" })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Archived (0)" })).toBeVisible();
    expect(screen.getByRole("button", { name: /^all \(4\)$/i })).toBeVisible();
  });

  it("toggles a status into the filter when clicked", async () => {
    const user = userEvent.setup();
    render(<MyProblemStatusTabs />);

    await user.click(screen.getByRole("button", { name: "Draft (0)" }));

    expect(useMyProblemListStore.getState().statusFilter).toEqual(["Draft"]);
  });

  it("clears the filter when All is clicked", async () => {
    useMyProblemListStore.setState({ statusFilter: ["Draft", "Pending"] });
    const user = userEvent.setup();
    render(<MyProblemStatusTabs />);

    await user.click(screen.getByRole("button", { name: /^all/i }));

    expect(useMyProblemListStore.getState().statusFilter).toEqual([]);
  });
});

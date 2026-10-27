import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MyProblemsStatCards from "./my-problems-stat-cards";
import { useMyProblemsMetadata } from "../api/get-my-problems-metadata";
import { buildMyProblemsMetadata } from "@/test/factories/problem";

vi.mock("../api/get-my-problems-metadata", () => ({
  useMyProblemsMetadata: vi.fn(),
}));

const mockedUseMyProblemsMetadata = vi.mocked(useMyProblemsMetadata);

function mockMetadata(
  overrides: Partial<ReturnType<typeof useMyProblemsMetadata>> = {}
) {
  mockedUseMyProblemsMetadata.mockReturnValue({
    data: undefined,
    isLoading: false,
    ...overrides,
  } as unknown as ReturnType<typeof useMyProblemsMetadata>);
}

describe("MyProblemsStatCards", () => {
  beforeEach(() => {
    mockMetadata();
  });

  it("shows a placeholder for each stat while loading", () => {
    mockMetadata({ isLoading: true });

    render(<MyProblemsStatCards />);

    expect(screen.getAllByText("—")).toHaveLength(3);
  });

  it("renders the submissions, reactions, and completion rate", () => {
    mockMetadata({
      data: buildMyProblemsMetadata({
        totalSubmissions: 42,
        totalReactions: 7,
        averageCompletionRate: 0.375,
      }),
    });

    render(<MyProblemsStatCards />);

    expect(screen.getByText("Total Submissions")).toBeVisible();
    expect(screen.getByText("42")).toBeVisible();
    expect(screen.getByText("Total Reactions")).toBeVisible();
    expect(screen.getByText("7")).toBeVisible();
    expect(screen.getByText("Avg. Completion Rate")).toBeVisible();
    expect(screen.getByText("38%")).toBeVisible();
  });

  it("defaults to zero values when there is no data yet", () => {
    render(<MyProblemsStatCards />);

    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getByText("0%")).toBeVisible();
  });
});

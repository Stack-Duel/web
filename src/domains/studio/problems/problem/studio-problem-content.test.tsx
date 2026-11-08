import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StudioProblemContent from "./studio-problem-content";
import { useSuspenseStudioProblemDetails } from "../../api/get-studio-problem";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";
import { NextNotFoundError } from "@/test/mocks/next-navigation";

vi.mock("@/domains/studio/api/get-studio-problem", () => ({
  useSuspenseStudioProblemDetails: vi.fn(),
}));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockUseSuspenseStudioProblemDetails = vi.mocked(
  useSuspenseStudioProblemDetails
);

describe("StudioProblemContent", () => {
  it("shows the slug, title, difficulty, and status", () => {
    mockUseSuspenseStudioProblemDetails.mockReturnValue({
      data: buildStudioProblemDetails({
        slug: "two-sum",
        title: "Two Sum",
        difficultyTier: "Easy",
        status: "Published",
      }),
    } as unknown as ReturnType<typeof useSuspenseStudioProblemDetails>);

    render(<StudioProblemContent id="problem_1" />);

    expect(screen.getByText("two-sum")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Two Sum" })).toBeVisible();
    expect(screen.getByText("Easy")).toBeVisible();
    expect(screen.getByText("Published")).toBeVisible();
  });

  it("shows the time limit, memory limit, setup count, and creation date", () => {
    mockUseSuspenseStudioProblemDetails.mockReturnValue({
      data: buildStudioProblemDetails({
        timeLimitMs: 1500,
        memoryLimitMb: 128,
        setupCount: 3,
        createdAt: "2026-02-10T00:00:00.000Z",
      }),
    } as unknown as ReturnType<typeof useSuspenseStudioProblemDetails>);

    render(<StudioProblemContent id="problem_1" />);

    expect(screen.getByText(/Time Limit 1500ms/)).toBeVisible();
    expect(screen.getByText(/Memory Limit 128MB/)).toBeVisible();
    expect(screen.getByText("3 setups")).toBeVisible();
    expect(
      screen.getByText(`Created on ${new Date("2026-02-10T00:00:00.000Z").toLocaleDateString()}`)
    ).toBeVisible();
  });

  it("uses the singular 'setup' label when there is exactly one", () => {
    mockUseSuspenseStudioProblemDetails.mockReturnValue({
      data: buildStudioProblemDetails({ setupCount: 1 }),
    } as unknown as ReturnType<typeof useSuspenseStudioProblemDetails>);

    render(<StudioProblemContent id="problem_1" />);

    expect(screen.getByText("1 setup")).toBeVisible();
  });

  it("shows attempt count, solve rate, and reaction count", () => {
    mockUseSuspenseStudioProblemDetails.mockReturnValue({
      data: buildStudioProblemDetails({
        attemptCount: 42,
        solveRatePercent: 75,
        reactionCount: 9,
      }),
    } as unknown as ReturnType<typeof useSuspenseStudioProblemDetails>);

    render(<StudioProblemContent id="problem_1" />);

    expect(screen.getByText("Total Attempts")).toBeVisible();
    expect(screen.getByText("42")).toBeVisible();
    expect(screen.getByText("Solve Rate")).toBeVisible();
    expect(screen.getByText("75%")).toBeVisible();
    expect(screen.getByText("Reactions")).toBeVisible();
    expect(screen.getByText("9")).toBeVisible();
  });

  it("triggers notFound when there is no data", () => {
    mockUseSuspenseStudioProblemDetails.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useSuspenseStudioProblemDetails>);

    expect(() => render(<StudioProblemContent id="problem_1" />)).toThrow(
      NextNotFoundError
    );
  });
});

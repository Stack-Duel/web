import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StudioProblemQuestion from "./studio-problem-question";
import { useSuspenseStudioProblemDetails } from "../../api/get-studio-problem";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";

vi.mock("@/domains/studio/api/get-studio-problem", () => ({
  useSuspenseStudioProblemDetails: vi.fn(),
}));

const mockUseSuspenseStudioProblemDetails = vi.mocked(
  useSuspenseStudioProblemDetails
);

describe("StudioProblemQuestion", () => {
  it("renders the problem's question as markdown", () => {
    mockUseSuspenseStudioProblemDetails.mockReturnValue({
      data: buildStudioProblemDetails({
        question: "## Given an array of integers, return two indices.",
      }),
    } as unknown as ReturnType<typeof useSuspenseStudioProblemDetails>);

    render(<StudioProblemQuestion problemId="problem_1" />);

    expect(
      screen.getByRole("heading", {
        name: "Given an array of integers, return two indices.",
      })
    ).toBeVisible();
  });

  it("requests the details for the given problem id", () => {
    mockUseSuspenseStudioProblemDetails.mockReturnValue({
      data: buildStudioProblemDetails(),
    } as unknown as ReturnType<typeof useSuspenseStudioProblemDetails>);

    render(<StudioProblemQuestion problemId="problem_42" />);

    expect(mockUseSuspenseStudioProblemDetails).toHaveBeenCalledWith({
      problemId: "problem_42",
    });
  });
});

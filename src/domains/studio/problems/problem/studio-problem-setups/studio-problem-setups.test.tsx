import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudioProblemSetups from "./studio-problem-setups";
import { useSuspenseStudioProblemSetups } from "../../../api/get-studio-problem-setups";
import { buildStudioProblemSetup } from "@/test/factories/studio-problem-setup";

vi.mock("@/domains/studio/api/get-studio-problem-setups", () => ({
  useSuspenseStudioProblemSetups: vi.fn(),
}));

const mockUseSuspenseStudioProblemSetups = vi.mocked(
  useSuspenseStudioProblemSetups
);

describe("StudioProblemSetups", () => {
  it("shows a message when there are no setups", () => {
    mockUseSuspenseStudioProblemSetups.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useSuspenseStudioProblemSetups>);

    render(<StudioProblemSetups problemId="problem_1" />);

    expect(
      screen.getByText("No language setups configured for this problem.")
    ).toBeVisible();
  });

  it("lists the language and version for each setup", () => {
    mockUseSuspenseStudioProblemSetups.mockReturnValue({
      data: [
        buildStudioProblemSetup({ language: "JavaScript", languageVersion: "ES2022" }),
        buildStudioProblemSetup({
          languageVersionId: "lang_version_2",
          language: "Python",
          languageVersion: "3.12",
        }),
      ],
    } as unknown as ReturnType<typeof useSuspenseStudioProblemSetups>);

    render(<StudioProblemSetups problemId="problem_1" />);

    expect(screen.getByText("JavaScript ES2022")).toBeVisible();
    expect(screen.getByText("Python 3.12")).toBeVisible();
  });

  it("shows the function name badge when present", () => {
    mockUseSuspenseStudioProblemSetups.mockReturnValue({
      data: [buildStudioProblemSetup({ functionName: "twoSum" })],
    } as unknown as ReturnType<typeof useSuspenseStudioProblemSetups>);

    render(<StudioProblemSetups problemId="problem_1" />);

    expect(screen.getByText("twoSum")).toBeVisible();
  });

  it("hides the function name and reference solution badges when absent", () => {
    mockUseSuspenseStudioProblemSetups.mockReturnValue({
      data: [buildStudioProblemSetup({ functionName: "", referenceSolution: "" })],
    } as unknown as ReturnType<typeof useSuspenseStudioProblemSetups>);

    const { container } = render(<StudioProblemSetups problemId="problem_1" />);

    expect(container.querySelectorAll('[data-slot="badge"]')).toHaveLength(0);
  });

  it("shows a reference solution badge only when one is present", () => {
    mockUseSuspenseStudioProblemSetups.mockReturnValue({
      data: [buildStudioProblemSetup({ referenceSolution: "function twoSum() { return [0, 1]; }" })],
    } as unknown as ReturnType<typeof useSuspenseStudioProblemSetups>);

    render(<StudioProblemSetups problemId="problem_1" />);

    expect(screen.getByText("Reference solution")).toBeVisible();
  });

  it("shows the test suite and test case counts and starter code when expanded", async () => {
    const user = userEvent.setup();
    mockUseSuspenseStudioProblemSetups.mockReturnValue({
      data: [
        buildStudioProblemSetup({
          language: "JavaScript",
          amountOfTestSuites: "2",
          amountOfTestCases: "10",
          starterCode: "function twoSum(nums, target) {}",
        }),
      ],
    } as unknown as ReturnType<typeof useSuspenseStudioProblemSetups>);

    render(<StudioProblemSetups problemId="problem_1" />);
    await user.click(screen.getByRole("button", { name: /JavaScript/ }));

    expect(screen.getByText("2")).toBeVisible();
    expect(screen.getByText("10")).toBeVisible();
    expect(
      screen.getByText("function twoSum(nums, target) {}")
    ).toBeVisible();
  });
});

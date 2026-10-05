import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SubmissionStatusPanel from "./submission-status-panel";
import { useSubmissionStatus } from "@/domains/submission/api/get-submission-status";

vi.mock("@/domains/submission/api/get-submission-status", () => ({
  useSubmissionStatus: vi.fn(),
}));

const mockedUseSubmissionStatus = vi.mocked(useSubmissionStatus);

function mockStatus(
  overrides: Partial<ReturnType<typeof useSubmissionStatus>> = {}
) {
  mockedUseSubmissionStatus.mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    ...overrides,
  } as unknown as ReturnType<typeof useSubmissionStatus>);
}

describe("SubmissionStatusPanel", () => {
  it("prompts to run or submit when no submission has started", () => {
    mockStatus();

    render(<SubmissionStatusPanel submissionId={null} isSubmitting={false} />);

    expect(
      screen.getByText(
        "Run or submit your solution to see live execution status here."
      )
    ).toBeVisible();
  });

  it("shows a starting message while submitting with no id yet", () => {
    mockStatus();

    render(<SubmissionStatusPanel submissionId={null} isSubmitting />);

    expect(screen.getByText("Starting execution...")).toBeVisible();
  });

  it("shows the query error message when the query fails", () => {
    mockStatus({ error: new Error("Network error") });

    render(
      <SubmissionStatusPanel submissionId="submission_1" isSubmitting={false} />
    );

    expect(screen.getByText("Network error")).toBeVisible();
  });

  it("shows a loading message before any data has arrived", () => {
    mockStatus({ isLoading: true });

    render(
      <SubmissionStatusPanel submissionId="submission_1" isSubmitting={false} />
    );

    expect(screen.getByText("Loading submission status...")).toBeVisible();
  });

  it("shows a pending message while the submission is still processing", () => {
    mockStatus({
      data: {
        submissionId: "submission_1",
        problemSetupId: "setup_1",
        status: "Running",
        code: "code",
        results: [],
      },
    });

    render(
      <SubmissionStatusPanel submissionId="submission_1" isSubmitting={false} />
    );

    expect(screen.getByText(/still being processed/)).toBeVisible();
  });

  it("renders a tab per test result once results arrive", () => {
    mockStatus({
      data: {
        submissionId: "submission_1",
        problemSetupId: "setup_1",
        status: "Accepted",
        code: "code",
        results: [
          {
            status: "Accepted",
            runtime: 10,
            memoryUsed: 500,
            input: "[1,2]",
            actualOutput: "[0,1]",
            expectedOutput: "[0,1]",
            standardOutput: null,
            standardError: null,
            compileOutput: null,
          },
        ],
      },
    });

    render(
      <SubmissionStatusPanel submissionId="submission_1" isSubmitting={false} />
    );

    expect(screen.getByRole("tab", { name: /Test 1/ })).toBeVisible();
    expect(screen.getAllByText("Accepted")[0]).toBeVisible();
  });

  it("shows a completed-without-details message when terminal with no results", () => {
    mockStatus({
      data: {
        submissionId: "submission_1",
        problemSetupId: "setup_1",
        status: "Accepted",
        code: "code",
        results: [],
      },
    });

    render(
      <SubmissionStatusPanel submissionId="submission_1" isSubmitting={false} />
    );

    expect(
      screen.getByText(
        "This submission completed without any test result details."
      )
    ).toBeVisible();
  });
});

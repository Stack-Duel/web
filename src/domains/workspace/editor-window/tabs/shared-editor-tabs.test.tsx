import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DescriptionTabIcon,
  FlaskConicalTabIcon,
  createDescriptionTab,
  createTestsTab,
  createSubmissionTab,
} from "./shared-editor-tabs";

vi.mock("@/domains/problem/components/problem-question", () => ({
  ProblemQuestion: ({ problem }: { problem: { title: string } }) => (
    <div>Question: {problem.title}</div>
  ),
}));
vi.mock("@/domains/problem/components/problem-test-cases", () => ({
  default: ({ testCases }: { testCases: unknown[] }) => (
    <div>Test cases: {testCases.length}</div>
  ),
}));
vi.mock("@/domains/submission/components/submission-status-panel", () => ({
  default: ({
    submissionId,
    isSubmitting,
  }: {
    submissionId: string | null;
    isSubmitting: boolean;
  }) => (
    <div>
      Submission: {submissionId ?? "none"} /{" "}
      {isSubmitting ? "submitting" : "idle"}
    </div>
  ),
}));

describe("shared-editor-tabs", () => {
  it("renders the description and flask-conical tab icons", () => {
    const { unmount } = render(<DescriptionTabIcon />);
    unmount();
    render(<FlaskConicalTabIcon />);
  });

  it("createDescriptionTab shows the problem when given one", () => {
    const tab = createDescriptionTab({
      problem: { title: "Two Sum" } as never,
    });

    render(<>{tab.component}</>);

    expect(screen.getByText("Question: Two Sum")).toBeVisible();
  });

  it("createDescriptionTab shows the loading fallback when there is no problem", () => {
    const tab = createDescriptionTab({
      problem: null,
      loadingFallback: <div>Loading...</div>,
    });

    render(<>{tab.component}</>);

    expect(screen.getByText("Loading...")).toBeVisible();
  });

  it("createTestsTab wraps the given test cases", () => {
    const tab = createTestsTab([{} as never, {} as never]);

    render(<>{tab.component}</>);

    expect(screen.getByText("Test cases: 2")).toBeVisible();
  });

  it("createSubmissionTab wraps the submission status panel", () => {
    const tab = createSubmissionTab({
      submissionId: "sub-1",
      isSubmitting: true,
    });

    render(<>{tab.component}</>);

    expect(screen.getByText(/Submission: sub-1/)).toBeVisible();
  });
});

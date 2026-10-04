import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSubmitSolution } from "./use-submit-solution";
import { useWorkspaceStore } from "../state/workspace-store";
import { useCreateRunSubmission } from "@/domains/submission/api/create-run-submission";
import { useCreateGradeSubmission } from "@/domains/submission/api/create-grade-submission";
import { waitForTerminalSubmission } from "@/domains/submission/api/wait-for-terminal-submission";
import { submissionStatusQueryKey } from "@/domains/submission/api/get-submission-status";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/domains/submission/api/create-run-submission");
vi.mock("@/domains/submission/api/create-grade-submission");
vi.mock("@/domains/submission/api/wait-for-terminal-submission");

const mockUseCreateRunSubmission = vi.mocked(useCreateRunSubmission);
const mockUseCreateGradeSubmission = vi.mocked(useCreateGradeSubmission);
const mockWaitForTerminalSubmission = vi.mocked(waitForTerminalSubmission);

const initialWorkspaceState = useWorkspaceStore.getState();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    queryClient,
    Wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe("useSubmitSolution", () => {
  const runSubmissionMutateAsync = vi.fn();
  const gradeSubmissionMutateAsync = vi.fn();

  beforeEach(() => {
    useWorkspaceStore.setState(initialWorkspaceState, true);
    vi.clearAllMocks();

    runSubmissionMutateAsync.mockResolvedValue("run-sub-1");
    gradeSubmissionMutateAsync.mockResolvedValue("grade-sub-1");
    mockWaitForTerminalSubmission.mockResolvedValue({
      submissionId: "run-sub-1",
      problemSetupId: "setup-1",
      status: "Accepted",
      code: "",
      results: [],
    });

    mockUseCreateRunSubmission.mockReturnValue({
      mutateAsync: runSubmissionMutateAsync,
    } as unknown as ReturnType<typeof useCreateRunSubmission>);
    mockUseCreateGradeSubmission.mockReturnValue({
      mutateAsync: gradeSubmissionMutateAsync,
    } as unknown as ReturnType<typeof useCreateGradeSubmission>);
  });

  it("shows an error toast and does nothing when there is no problemSetupId", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSubmitSolution(null), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.runCode();
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Problem setup is not ready yet")
    );
    expect(runSubmissionMutateAsync).not.toHaveBeenCalled();
  });

  it("runs the code, dropping blank custom test case inputs", async () => {
    useWorkspaceStore.setState({
      code: "print(1)",
      customTestCases: [{ inputs: ["1", ""] }, { inputs: ["", ""] }],
    });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSubmitSolution("setup-1"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.runCode();
    });

    await waitFor(() =>
      expect(useWorkspaceStore.getState().activeSubmissionId).toBe("run-sub-1")
    );
    expect(runSubmissionMutateAsync).toHaveBeenCalledWith({
      problemSetupId: "setup-1",
      code: "print(1)",
      customTestCases: [{ inputs: ["1"] }],
    });
    expect(toast.success).toHaveBeenCalledWith("Run started");
  });

  it("omits customTestCases entirely when every case is blank", async () => {
    useWorkspaceStore.setState({
      code: "print(1)",
      customTestCases: [{ inputs: ["", ""] }],
    });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSubmitSolution("setup-1"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.runCode();
    });

    await waitFor(() =>
      expect(runSubmissionMutateAsync).toHaveBeenCalledWith({
        problemSetupId: "setup-1",
        code: "print(1)",
        customTestCases: undefined,
      })
    );
  });

  it("submits the code for grading via submitCode", async () => {
    useWorkspaceStore.setState({ code: "print(2)" });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSubmitSolution("setup-1"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.submitCode();
    });

    await waitFor(() =>
      expect(useWorkspaceStore.getState().activeSubmissionId).toBe(
        "grade-sub-1"
      )
    );
    expect(gradeSubmissionMutateAsync).toHaveBeenCalledWith({
      problemSetupId: "setup-1",
      code: "print(2)",
    });
    expect(toast.success).toHaveBeenCalledWith("Submission created");
  });

  it("switches both the mobile and desktop tab groups to the submission tab", async () => {
    useWorkspaceStore.setState({ code: "print(2)" });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSubmitSolution("setup-1"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.submitCode();
    });

    await waitFor(() =>
      expect(useWorkspaceStore.getState().activeTabByNode).toEqual({
        root: 3,
        execution: 1,
      })
    );
  });

  it("clears the submitting flag and shows the error message when the mutation fails", async () => {
    runSubmissionMutateAsync.mockRejectedValue(new Error("network down"));
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSubmitSolution("setup-1"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.runCode();
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("network down")
    );
    expect(useWorkspaceStore.getState().isSubmittingSubmission).toBe(false);
  });

  it("falls back to a generic error message for a non-Error rejection", async () => {
    gradeSubmissionMutateAsync.mockRejectedValue("boom");
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSubmitSolution("setup-1"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.submitCode();
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to submit solution")
    );
  });

  it("writes the terminal submission status into the query cache once it resolves", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useSubmitSolution("setup-1"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.runCode();
    });

    await waitFor(() =>
      expect(
        queryClient.getQueryData(submissionStatusQueryKey("run-sub-1"))
      ).toEqual({
        submissionId: "run-sub-1",
        problemSetupId: "setup-1",
        status: "Accepted",
        code: "",
        results: [],
      })
    );
  });
});

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCreateRunSubmission } from "@/domains/submission/api/create-run-submission";
import { useCreateGradeSubmission } from "@/domains/submission/api/create-grade-submission";
import { waitForTerminalSubmission } from "@/domains/submission/api/wait-for-terminal-submission";
import { submissionStatusQueryKey } from "@/domains/submission/api/get-submission-status";
import { useWorkspaceStore } from "../state/workspace-store";

/**
 * Runs or submits the current code for grading. Replaces the
 * `runCodeRequested`/`submitCodeRequested` listener effect: creates a run or
 * grade submission, switches the workspace over to the Submission tab, and
 * kicks off a background wait for the submission to reach a terminal state
 * (SignalR push, 60s timeout fallback) so the status panel updates promptly
 * even if its own 10s poll hasn't ticked yet. The poll is still the fallback
 * if this misses.
 */
export function useSubmitSolution(problemSetupId: string | null) {
  const queryClient = useQueryClient();
  const beginSubmission = useWorkspaceStore((s) => s.beginSubmission);
  const setSubmittingSubmission = useWorkspaceStore(
    (s) => s.setSubmittingSubmission
  );
  const setActiveSubmissionId = useWorkspaceStore(
    (s) => s.setActiveSubmissionId
  );
  const setActiveTab = useWorkspaceStore((s) => s.setActiveTab);

  const { mutateAsync: createRunSubmission } = useCreateRunSubmission();
  const { mutateAsync: createGradeSubmission } = useCreateGradeSubmission();

  const submit = async (isRun: boolean) => {
    if (!problemSetupId) {
      toast.error("Problem setup is not ready yet");
      return;
    }

    beginSubmission();

    const { code, additionalFiles, customTestCases } =
      useWorkspaceStore.getState();

    try {
      // Mobile: a single flat tabs group ("root") holding
      // [code, problem, tests, submission, ...preview?]. Submission is
      // always index 3 regardless of whether the React-only preview tab is
      // present, since it's appended after submission.
      setActiveTab("root", 3);
      // Desktop: the Execution pane is its own tabs group ("execution")
      // holding [tests, submission, ...preview?]. Submission is always
      // index 1 for the same reason.
      setActiveTab("execution", 1);

      // Blank fields (an unfilled parameter, or a case the user added but never
      // filled in) are dropped rather than sent as literal empty strings, since the
      // backend already treats a case with zero non-blank inputs as pointless.
      const nonEmptyCustomTestCases = customTestCases
        .map((testCase) => ({
          inputs: testCase.inputs.filter((value) => value.trim() !== ""),
        }))
        .filter((testCase) => testCase.inputs.length > 0);

      const submissionId = isRun
        ? await createRunSubmission({
            problemSetupId,
            code,
            customTestCases:
              nonEmptyCustomTestCases.length > 0
                ? nonEmptyCustomTestCases
                : undefined,
            additionalFiles:
              additionalFiles.length > 0 ? additionalFiles : undefined,
          })
        : await createGradeSubmission({
            problemSetupId,
            code,
            additionalFiles:
              additionalFiles.length > 0 ? additionalFiles : undefined,
          });

      setActiveSubmissionId(submissionId);
      toast.success(isRun ? "Run started" : "Submission created");

      // Fire-and-forget: the panel is already polling this submission, this
      // just shaves the latency down to (roughly) the push arriving instead
      // of waiting for the next 10s poll tick.
      void waitForTerminalSubmission(queryClient, submissionId).then(
        (status) => {
          queryClient.setQueryData(
            submissionStatusQueryKey(submissionId),
            status
          );
        }
      );
    } catch (error) {
      const fallbackMessage = isRun
        ? "Failed to run solution"
        : "Failed to submit solution";
      const message = error instanceof Error ? error.message : fallbackMessage;
      toast.error(message);
    } finally {
      setSubmittingSubmission(false);
    }
  };

  return {
    runCode: () => void submit(true),
    submitCode: () => void submit(false),
  };
}

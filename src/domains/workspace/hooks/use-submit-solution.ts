"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCreateRunSubmission } from "@/domains/submission/api/create-run-submission";
import { useCreateGradeSubmission } from "@/domains/submission/api/create-grade-submission";
import { waitForTerminalSubmission } from "@/domains/submission/api/wait-for-terminal-submission";
import { submissionStatusQueryKey } from "@/domains/submission/api/get-submission-status";
import { useWorkspaceStore } from "../state/workspace-store";

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
      setActiveTab("root", 3);
      setActiveTab("execution", 1);

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

      void waitForTerminalSubmission(queryClient, submissionId).then(
        (outcome) => {
          if (outcome.kind !== "terminal") return;

          queryClient.setQueryData(
            submissionStatusQueryKey(submissionId),
            outcome.submission
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

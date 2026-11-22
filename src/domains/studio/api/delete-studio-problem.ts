import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type ProblemDeletionOutcome = "Deleted" | "Removed";

export type DeleteStudioProblemVariables = {
  problemId: string;
  confirmationTitle: string;
};

export const deleteStudioProblem = ({
  problemId,
  confirmationTitle,
  signal,
}: DeleteStudioProblemVariables & RequestConfig) =>
  http.delete<ProblemDeletionOutcome>(`/api/v1/studio/problems/${problemId}`, {
    ...toAxiosConfig({ signal }),
    data: { confirmationTitle },
  });

const deleteStudioProblemMutation = defineMutation<
  ProblemDeletionOutcome,
  DeleteStudioProblemVariables
>({
  mutationFn: deleteStudioProblem,
  invalidateQueries: () => [["studio-problems"], ["problems"]],
});

export const useDeleteStudioProblem = deleteStudioProblemMutation.useMutation;

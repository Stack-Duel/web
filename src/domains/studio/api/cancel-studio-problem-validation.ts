import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type CancelStudioProblemValidationVariables = {
  problemId: string;
};

export const cancelStudioProblemValidation = ({
  problemId,
  signal,
}: CancelStudioProblemValidationVariables & RequestConfig) =>
  http.post<void>(
    `/api/v1/studio/problems/${problemId}/cancel-validation`,
    {},
    toAxiosConfig({ signal })
  );

const cancelStudioProblemValidationMutation = defineMutation<
  void,
  CancelStudioProblemValidationVariables
>({
  mutationFn: cancelStudioProblemValidation,
  invalidateQueries: (_data, variables) => [
    ["studio-problem-details", variables.problemId],
    ["studio-problems"],
  ],
});

export const useCancelStudioProblemValidation =
  cancelStudioProblemValidationMutation.useMutation;

import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type SubmitStudioProblemForValidationVariables = {
  problemId: string;
};

export const submitStudioProblemForValidation = ({
  problemId,
  signal,
}: SubmitStudioProblemForValidationVariables & RequestConfig) =>
  http.post<void>(
    `/api/v1/studio/problems/${problemId}/submit-for-validation`,
    {},
    toAxiosConfig({ signal })
  );

const submitStudioProblemForValidationMutation = defineMutation<
  void,
  SubmitStudioProblemForValidationVariables
>({
  mutationFn: submitStudioProblemForValidation,
  invalidateQueries: (_data, variables) => [
    ["studio-problem-details", variables.problemId],
    ["studio-problems"],
  ],
});

export const useSubmitStudioProblemForValidation =
  submitStudioProblemForValidationMutation.useMutation;

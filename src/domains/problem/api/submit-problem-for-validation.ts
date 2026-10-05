import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type SubmitProblemForValidationVariables = {
  problemId: string;
};

export const submitProblemForValidation = ({
  problemId,
  signal,
}: SubmitProblemForValidationVariables & RequestConfig) =>
  http.post<void>(
    `/api/v1/problem/admin/${problemId}/submit-for-validation`,
    {},
    toAxiosConfig({ signal })
  );

const submitProblemForValidationMutation = defineMutation<
  void,
  SubmitProblemForValidationVariables
>({
  mutationFn: submitProblemForValidation,
  invalidateQueries: (_data, variables) => [
    ["admin-problem-detail", variables.problemId],
  ],
});

export const useSubmitProblemForValidation =
  submitProblemForValidationMutation.useMutation;

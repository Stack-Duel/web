import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type RemoveStudioProblemSetupVariables = {
  problemId: string;
  languageVersionId: string;
};

export const removeStudioProblemSetup = ({
  problemId,
  languageVersionId,
  signal,
}: RemoveStudioProblemSetupVariables & RequestConfig) =>
  http.delete<void>(
    `/api/v1/studio/problems/${problemId}/setups/${languageVersionId}`,
    toAxiosConfig({ signal })
  );

const removeStudioProblemSetupMutation = defineMutation<
  void,
  RemoveStudioProblemSetupVariables
>({
  mutationFn: removeStudioProblemSetup,
  invalidateQueries: (_data, variables) => [
    ["studio-problem-setups", variables.problemId],
    ["studio-problem-details", variables.problemId],
  ],
});

export const useRemoveStudioProblemSetup =
  removeStudioProblemSetupMutation.useMutation;

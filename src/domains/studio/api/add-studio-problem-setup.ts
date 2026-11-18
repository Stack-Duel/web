import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type AddStudioProblemSetupVariables = {
  problemId: string;
  languageVersionId: string;
};

export const addStudioProblemSetup = ({
  problemId,
  languageVersionId,
  signal,
}: AddStudioProblemSetupVariables & RequestConfig) =>
  http.post<string>(
    `/api/v1/studio/problems/${problemId}/setups`,
    { languageVersionId },
    toAxiosConfig({ signal })
  );

const addStudioProblemSetupMutation = defineMutation<
  string,
  AddStudioProblemSetupVariables
>({
  mutationFn: addStudioProblemSetup,
  invalidateQueries: (_data, variables) => [
    ["studio-problem-setups", variables.problemId],
    ["studio-problem-details", variables.problemId],
  ],
});

export const useAddStudioProblemSetup =
  addStudioProblemSetupMutation.useMutation;

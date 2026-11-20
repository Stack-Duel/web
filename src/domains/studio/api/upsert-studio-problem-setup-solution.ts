import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type UpsertStudioProblemSetupSolutionVariables = {
  problemId: string;
  languageVersionId: string;
  starterCode: string;
  functionName: string | null;
  referenceSolution: string;
};

export const upsertStudioProblemSetupSolution = ({
  problemId,
  languageVersionId,
  starterCode,
  functionName,
  referenceSolution,
  signal,
}: UpsertStudioProblemSetupSolutionVariables & RequestConfig) =>
  http.put<string>(
    `/api/v1/studio/problems/${problemId}/setups/reference-solution`,
    { languageVersionId, starterCode, functionName, referenceSolution },
    toAxiosConfig({ signal })
  );

const upsertStudioProblemSetupSolutionMutation = defineMutation<
  string,
  UpsertStudioProblemSetupSolutionVariables
>({
  mutationFn: upsertStudioProblemSetupSolution,
  invalidateQueries: (_data, variables) => [
    ["studio-problem-setups", variables.problemId],
    ["studio-problem-details", variables.problemId],
  ],
});

export const useUpsertStudioProblemSetupSolution =
  upsertStudioProblemSetupSolutionMutation.useMutation;

import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type UpsertProblemSetupReferenceSolutionVariables = {
  problemId: string;
  languageVersionId: string;
  initialCode: string;
  functionName: string | null;
  referenceSolutionCode: string;
};

export const upsertProblemSetupReferenceSolution = ({
  problemId,
  languageVersionId,
  initialCode,
  functionName,
  referenceSolutionCode,
  signal,
}: UpsertProblemSetupReferenceSolutionVariables & RequestConfig) =>
  http.put<string>(
    `/api/v1/problem/admin/${problemId}/setups/reference-solution`,
    { languageVersionId, initialCode, functionName, referenceSolutionCode },
    toAxiosConfig({ signal })
  );

const upsertProblemSetupReferenceSolutionMutation = defineMutation<
  string,
  UpsertProblemSetupReferenceSolutionVariables
>({
  mutationFn: upsertProblemSetupReferenceSolution,
  invalidateQueries: (_data, variables) => [
    ["admin-problem-detail", variables.problemId],
  ],
});

export const useUpsertProblemSetupReferenceSolution =
  upsertProblemSetupReferenceSolutionMutation.useMutation;

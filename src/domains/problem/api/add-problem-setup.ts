import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type AddProblemSetupVariables = {
  problemId: string;
  languageVersionId: string;
};

export const addProblemSetup = ({
  problemId,
  languageVersionId,
  signal,
}: AddProblemSetupVariables & RequestConfig) =>
  http.post<string>(
    `/api/v1/problem/admin/${problemId}/setups`,
    { languageVersionId },
    toAxiosConfig({ signal })
  );

const addProblemSetupMutation = defineMutation<
  string,
  AddProblemSetupVariables
>({
  mutationFn: addProblemSetup,
  invalidateQueries: (_data, variables) => [
    ["admin-problem-detail", variables.problemId],
  ],
});

export const useAddProblemSetup = addProblemSetupMutation.useMutation;

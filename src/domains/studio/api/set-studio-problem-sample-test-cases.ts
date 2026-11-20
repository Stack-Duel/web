import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { SampleTestCase } from "@/domains/problem/models/sample-test-case";

export type SetStudioProblemSampleTestCasesVariables = {
  problemId: string;
  testCases: SampleTestCase[];
};

export const setStudioProblemSampleTestCases = ({
  problemId,
  testCases,
  signal,
}: SetStudioProblemSampleTestCasesVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/studio/problems/${problemId}/sample-test-cases`,
    { testCases },
    toAxiosConfig({ signal })
  );

const setStudioProblemSampleTestCasesMutation = defineMutation<
  void,
  SetStudioProblemSampleTestCasesVariables
>({
  mutationFn: setStudioProblemSampleTestCases,
  invalidateQueries: (_data, variables) => [
    ["studio-problem-setups", variables.problemId],
    ["studio-problem-details", variables.problemId],
  ],
});

export const useSetStudioProblemSampleTestCases =
  setStudioProblemSampleTestCasesMutation.useMutation;

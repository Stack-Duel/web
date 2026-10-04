import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { SampleTestCase } from "../models/sample-test-case";

export type SetProblemSampleTestCasesVariables = {
  problemId: string;
  testCases: SampleTestCase[];
};

export const setProblemSampleTestCases = ({
  problemId,
  testCases,
  signal,
}: SetProblemSampleTestCasesVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/problem/admin/${problemId}/sample-test-cases`,
    { testCases },
    toAxiosConfig({ signal })
  );

const setProblemSampleTestCasesMutation = defineMutation<
  void,
  SetProblemSampleTestCasesVariables
>({
  mutationFn: setProblemSampleTestCases,
  invalidateQueries: (_data, variables) => [
    ["admin-problem-detail", variables.problemId],
  ],
});

export const useSetProblemSampleTestCases =
  setProblemSampleTestCasesMutation.useMutation;

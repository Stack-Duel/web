import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { GenerationParameter } from "../models/generation-parameters";

export type SetProblemGenerationParametersVariables = {
  problemId: string;
  parameters: GenerationParameter[];
  outputValueType: string;
  targetCaseCount: number;
  seed: number;
};

export const setProblemGenerationParameters = ({
  problemId,
  parameters,
  outputValueType,
  targetCaseCount,
  seed,
  signal,
}: SetProblemGenerationParametersVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/problem/admin/${problemId}/generation-parameters`,
    { parameters, outputValueType, targetCaseCount, seed },
    toAxiosConfig({ signal })
  );

const setProblemGenerationParametersMutation = defineMutation<
  void,
  SetProblemGenerationParametersVariables
>({
  mutationFn: setProblemGenerationParameters,
  invalidateQueries: (_data, variables) => [
    ["admin-problem-detail", variables.problemId],
  ],
});

export const useSetProblemGenerationParameters =
  setProblemGenerationParametersMutation.useMutation;

import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { GenerationParameter } from "@/domains/problem/models/generation-parameters";

export type SetStudioProblemGenerationParametersVariables = {
  problemId: string;
  parameters: GenerationParameter[];
  outputValueType: string;
  targetCaseCount: number;
  seed: number;
};

export const setStudioProblemGenerationParameters = ({
  problemId,
  parameters,
  outputValueType,
  targetCaseCount,
  seed,
  signal,
}: SetStudioProblemGenerationParametersVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/studio/problems/${problemId}/generation-parameters`,
    { parameters, outputValueType, targetCaseCount, seed },
    toAxiosConfig({ signal })
  );

const setStudioProblemGenerationParametersMutation = defineMutation<
  void,
  SetStudioProblemGenerationParametersVariables
>({
  mutationFn: setStudioProblemGenerationParameters,
  invalidateQueries: (_data, variables) => [
    ["studio-problem-details", variables.problemId],
  ],
});

export const useSetStudioProblemGenerationParameters =
  setStudioProblemGenerationParametersMutation.useMutation;

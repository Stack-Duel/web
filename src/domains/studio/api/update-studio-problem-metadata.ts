import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type UpdateStudioProblemMetadataVariables = {
  problemId: string;
  title: string;
  question: string;
  difficulty: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
};

export const updateStudioProblemMetadata = ({
  problemId,
  title,
  question,
  difficulty,
  timeLimitMs,
  memoryLimitMb,
  tags,
  signal,
}: UpdateStudioProblemMetadataVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/studio/problems/${problemId}`,
    { title, question, difficulty, timeLimitMs, memoryLimitMb, tags },
    toAxiosConfig({ signal })
  );

const updateStudioProblemMetadataMutation = defineMutation<
  void,
  UpdateStudioProblemMetadataVariables
>({
  mutationFn: updateStudioProblemMetadata,
  invalidateQueries: (_data, variables) => [
    ["studio-problem-details", variables.problemId],
    ["studio-problems"],
  ],
});

export const useUpdateStudioProblemMetadata =
  updateStudioProblemMetadataMutation.useMutation;

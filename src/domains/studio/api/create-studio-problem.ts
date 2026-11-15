import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type CreateStudioProblemVariables = {
  title: string;
  question: string;
  difficulty: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
  trackId: string;
};

export const createStudioProblem = ({
  title,
  question,
  difficulty,
  timeLimitMs,
  memoryLimitMb,
  tags,
  trackId,
  signal,
}: CreateStudioProblemVariables & RequestConfig) =>
  http.post<string>(
    "/api/v1/studio/problems",
    { title, question, difficulty, timeLimitMs, memoryLimitMb, tags, trackId },
    toAxiosConfig({ signal })
  );

const createStudioProblemMutation = defineMutation<
  string,
  CreateStudioProblemVariables
>({
  mutationFn: createStudioProblem,
  invalidateQueries: () => [["studio-problems"]],
});

export const useCreateStudioProblem = createStudioProblemMutation.useMutation;

import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type CreateProblemDraftVariables = {
  title: string;
  question: string;
  difficulty: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
  trackId: string;
};

export const createProblemDraft = ({
  title,
  question,
  difficulty,
  timeLimitMs,
  memoryLimitMb,
  tags,
  trackId,
  signal,
}: CreateProblemDraftVariables & RequestConfig) =>
  http.post<string>(
    "/api/v1/problem/admin",
    { title, question, difficulty, timeLimitMs, memoryLimitMb, tags, trackId },
    toAxiosConfig({ signal })
  );

const createProblemDraftMutation = defineMutation<
  string,
  CreateProblemDraftVariables
>({
  mutationFn: createProblemDraft,
  invalidateQueries: () => [["admin-problems"]],
});

export const useCreateProblemDraft = createProblemDraftMutation.useMutation;

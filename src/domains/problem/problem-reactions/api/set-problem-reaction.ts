import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { ProblemReactionSummary } from "../models/problem-reaction";

type SetProblemReactionVariables = {
  problemId: string;
  reactionTypeKey: string;
};

export const setProblemReaction = ({
  problemId,
  reactionTypeKey,
  signal,
}: SetProblemReactionVariables & RequestConfig) =>
  http.post<ProblemReactionSummary>(
    `/api/v1/problem/${problemId}/reaction`,
    { reactionTypeKey },
    toAxiosConfig({ signal })
  );

const setProblemReactionMutation = defineMutation<
  ProblemReactionSummary,
  SetProblemReactionVariables
>({
  mutationFn: setProblemReaction,
  invalidateQueries: (_data, { problemId }) => [
    ["problem-reaction", problemId],
  ],
});

export const useSetProblemReaction = setProblemReactionMutation.useMutation;

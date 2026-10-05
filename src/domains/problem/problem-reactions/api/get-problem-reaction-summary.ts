import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { ProblemReactionSummary } from "../models/problem-reaction";

type GetProblemReactionSummaryParams = {
  problemId: string;
};

export const getProblemReactionSummary = ({
  problemId,
  signal,
}: GetProblemReactionSummaryParams & RequestConfig) =>
  http.get<ProblemReactionSummary>(
    `/api/v1/problem/${problemId}/reaction`,
    toAxiosConfig({ signal })
  );

const problemReactionSummaryQuery = defineQuery<
  ProblemReactionSummary,
  GetProblemReactionSummaryParams
>({
  queryKey: ({ problemId }) => ["problem-reaction", problemId],
  queryFn: getProblemReactionSummary,
  meta: { errorToast: "Error loading problem reactions" },
});

export const useProblemReactionSummary = problemReactionSummaryQuery.useQuery;

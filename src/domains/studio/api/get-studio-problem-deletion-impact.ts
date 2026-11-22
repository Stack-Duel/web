import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type ProblemDeletionImpact = {
  submissionCount: number;
  gameRoundCount: number;
  unfinishedGameCount: number;
  dailyChallengeCount: number;
  campaignUnitCount: number;
  poolCount: number;
  isInPlay: boolean;
  hasHistory: boolean;
};

type GetStudioProblemDeletionImpactParams = { problemId: string };

export const getStudioProblemDeletionImpact = ({
  problemId,
  signal,
}: GetStudioProblemDeletionImpactParams & RequestConfig) =>
  http.get<ProblemDeletionImpact>(
    `/api/v1/studio/problems/${problemId}/deletion-impact`,
    toAxiosConfig({ signal })
  );

const studioProblemDeletionImpactQuery = defineQuery<
  ProblemDeletionImpact,
  GetStudioProblemDeletionImpactParams
>({
  queryKey: ({ problemId }) => ["studio-problem-deletion-impact", problemId],
  queryFn: getStudioProblemDeletionImpact,
});

export const useStudioProblemDeletionImpact =
  studioProblemDeletionImpactQuery.useQuery;

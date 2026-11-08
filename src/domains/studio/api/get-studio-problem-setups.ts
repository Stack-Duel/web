import { http } from "@/shared/lib/http";
import { StudioProblemSetup } from "../models/studio-problem-setup";
import { RequestConfig, toAxiosConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";

type GetStudioProblemSetupsParams = { problemId: string };

export const getStudioProblemSetups = ({
  problemId,
  signal,
}: GetStudioProblemSetupsParams & RequestConfig) =>
  http.get<StudioProblemSetup[]>(
    `/api/v1/studio/problems/${problemId}/setups`,
    toAxiosConfig({ signal })
  );

const studioProblemSetupsQuery = defineQuery<
  StudioProblemSetup[],
  GetStudioProblemSetupsParams
>({
  queryKey: ({ problemId }) => ["studio-problem-setups", problemId],
  queryFn: getStudioProblemSetups,
});

export const useStudioProblemSetups = studioProblemSetupsQuery.useQuery;
export const useSuspenseStudioProblemSetups =
  studioProblemSetupsQuery.useSuspenseQuery;

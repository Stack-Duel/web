import { http } from "@/shared/lib/http";
import { StudioProblemDetails } from "../models/studio-problem-details";
import { RequestConfig, toAxiosConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";

type GetStudioProblemsParams = { problemId: string };

export const getStudioProblems = ({
  problemId,
  signal,
}: GetStudioProblemsParams & RequestConfig) =>
  http.get<StudioProblemDetails>(
    `/api/v1/studio/problems/${problemId}`,
    toAxiosConfig({ signal })
  );

const studioProblemDetailsQuery = defineQuery<
  StudioProblemDetails,
  GetStudioProblemsParams
>({
  queryKey: ({ problemId }) => ["studio-problem-details", problemId],
  queryFn: getStudioProblems,
});

export const useStudioProblemDetails = studioProblemDetailsQuery.useQuery;
export const useSuspenseStudioProblemDetails =
  studioProblemDetailsQuery.useSuspenseQuery;

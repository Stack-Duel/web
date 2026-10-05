import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { Problem } from "../models/problem";

type GetProblemByIdParams = { id: string };

export const getProblemById = ({
  id,
  signal,
}: GetProblemByIdParams & RequestConfig) =>
  http.get<Problem>(`/api/v1/problem/by-id/${id}`, toAxiosConfig({ signal }));

const problemByIdQuery = defineQuery<Problem, GetProblemByIdParams>({
  queryKey: ({ id }) => ["problem-by-id", id],
  queryFn: getProblemById,
});

export const useProblemById = problemByIdQuery.useQuery;
export const problemByIdQueryOptions = problemByIdQuery.queryOptions;

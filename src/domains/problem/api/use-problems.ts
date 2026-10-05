import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type { ProblemSummary } from "../models/problem-summary";
import { defineQuery } from "@/shared/api/define-query";

type GetProblemsParams = {
  page: number;
  size: number;
  timestamp: string;
  search?: string;
};

export const getProblems = ({
  page,
  size,
  timestamp,
  search,
  signal,
}: GetProblemsParams & RequestConfig) =>
  http.get<PageResult<ProblemSummary>>("/api/v1/problem", {
    ...toAxiosConfig({ signal }),
    params: { page, size, timestamp, search },
  });

const problemsQuery = defineQuery<
  PageResult<ProblemSummary>,
  GetProblemsParams
>({
  queryKey: ({ page, size, timestamp, search }) => [
    "problems",
    page,
    size,
    timestamp,
    search,
  ],
  queryFn: getProblems,
  meta: { errorToast: "Error loading problems" },
});

export const useProblems = problemsQuery.useQuery;

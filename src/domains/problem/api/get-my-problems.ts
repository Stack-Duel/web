import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type { MyProblemListItem } from "../models/my-problem";

type GetMyProblemsParams = {
  page: number;
  size: number;
  timestamp: string;
  search?: string;
  statuses?: string[];
};

export const getMyProblems = ({
  page,
  size,
  timestamp,
  search,
  statuses,
  signal,
}: GetMyProblemsParams & RequestConfig) =>
  http.get<PageResult<MyProblemListItem>>("/api/v1/problem/mine", {
    ...toAxiosConfig({ signal }),
    params: { page, size, timestamp, search, statuses },
    paramsSerializer: { indexes: null },
  });

const myProblemsQuery = defineQuery<PageResult<MyProblemListItem>, GetMyProblemsParams>({
  queryKey: ({ page, size, timestamp, search, statuses }) => [
    "my-problems",
    page,
    size,
    timestamp,
    search,
    statuses,
  ],
  queryFn: getMyProblems,
  meta: { errorToast: "Error loading your problems" },
});

export const useMyProblems = myProblemsQuery.useQuery;

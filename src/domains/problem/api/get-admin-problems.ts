import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type { AdminProblemListItem } from "../models/admin-problem";

type GetAdminProblemsParams = {
  page: number;
  size: number;
  timestamp: string;
  search?: string;
};

export const getAdminProblems = ({
  page,
  size,
  timestamp,
  search,
  signal,
}: GetAdminProblemsParams & RequestConfig) =>
  http.get<PageResult<AdminProblemListItem>>("/api/v1/problem/admin", {
    ...toAxiosConfig({ signal }),
    params: { page, size, timestamp, search },
  });

const adminProblemsQuery = defineQuery<
  PageResult<AdminProblemListItem>,
  GetAdminProblemsParams
>({
  queryKey: ({ page, size, timestamp, search }) => [
    "admin-problems",
    page,
    size,
    timestamp,
    search,
  ],
  queryFn: getAdminProblems,
  meta: { errorToast: "Error loading problems" },
});

export const useAdminProblems = adminProblemsQuery.useQuery;

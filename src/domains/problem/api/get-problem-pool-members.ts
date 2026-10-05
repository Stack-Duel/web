import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type { AdminProblemListItem } from "../models/admin-problem";

type GetProblemPoolMembersParams = {
  poolKey: string;
  page: number;
  size: number;
  timestamp: string;
};

export const getProblemPoolMembers = ({
  poolKey,
  page,
  size,
  timestamp,
  signal,
}: GetProblemPoolMembersParams & RequestConfig) =>
  http.get<PageResult<AdminProblemListItem>>(
    `/api/v1/problempool/${poolKey}/problems`,
    { ...toAxiosConfig({ signal }), params: { page, size, timestamp } }
  );

const problemPoolMembersQuery = defineQuery<
  PageResult<AdminProblemListItem>,
  GetProblemPoolMembersParams
>({
  queryKey: ({ poolKey, page, size, timestamp }) => [
    "problem-pool-members",
    poolKey,
    page,
    size,
    timestamp,
  ],
  queryFn: getProblemPoolMembers,
  meta: { errorToast: "Error loading pool problems" },
});

export const useProblemPoolMembers = problemPoolMembersQuery.useQuery;

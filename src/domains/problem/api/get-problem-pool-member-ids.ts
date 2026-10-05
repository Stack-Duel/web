import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type GetProblemPoolMemberIdsParams = {
  poolKey: string;
};

export const getProblemPoolMemberIds = ({
  poolKey,
  signal,
}: GetProblemPoolMemberIdsParams & RequestConfig) =>
  http.get<string[]>(
    `/api/v1/problempool/${poolKey}/problems/ids`,
    toAxiosConfig({ signal })
  );

const problemPoolMemberIdsQuery = defineQuery<
  string[],
  GetProblemPoolMemberIdsParams
>({
  queryKey: ({ poolKey }) => ["problem-pool-member-ids", poolKey],
  queryFn: getProblemPoolMemberIds,
  meta: { errorToast: "Error loading pool problems" },
});

export const useProblemPoolMemberIds = problemPoolMemberIdsQuery.useQuery;

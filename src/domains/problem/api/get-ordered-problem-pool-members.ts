import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type OrderedPoolMember = {
  id: string;
  title: string;
};

type GetOrderedProblemPoolMembersParams = {
  poolKey: string;
};

export const getOrderedProblemPoolMembers = ({
  poolKey,
  signal,
}: GetOrderedProblemPoolMembersParams & RequestConfig) =>
  http.get<OrderedPoolMember[]>(
    `/api/v1/problempool/${poolKey}/problems/ordered`,
    toAxiosConfig({ signal })
  );

const orderedProblemPoolMembersQuery = defineQuery<
  OrderedPoolMember[],
  GetOrderedProblemPoolMembersParams
>({
  queryKey: ({ poolKey }) => ["problem-pool-members-ordered", poolKey],
  queryFn: getOrderedProblemPoolMembers,
  meta: { errorToast: "Error loading pool order" },
});

export const useOrderedProblemPoolMembers =
  orderedProblemPoolMembersQuery.useQuery;

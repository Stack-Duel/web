import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type ReorderProblemPoolVariables = {
  poolKey: string;
  problemIds: string[];
};

export const reorderProblemPool = ({
  poolKey,
  problemIds,
  signal,
}: ReorderProblemPoolVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/problempool/${poolKey}/problems/reorder`,
    { problemIds },
    toAxiosConfig({ signal })
  );

const reorderProblemPoolMutation = defineMutation<
  void,
  ReorderProblemPoolVariables
>({
  mutationFn: reorderProblemPool,
  invalidateQueries: (_data, variables) => [
    ["problem-pool-members-ordered", variables.poolKey],
    ["problem-pool-members", variables.poolKey],
  ],
});

export const useReorderProblemPool = reorderProblemPoolMutation.useMutation;

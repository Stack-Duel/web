import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type RemoveProblemFromPoolVariables = {
  poolKey: string;
  problemId: string;
};

export const removeProblemFromPool = ({
  poolKey,
  problemId,
  signal,
}: RemoveProblemFromPoolVariables & RequestConfig) =>
  http.delete<void>(
    `/api/v1/problempool/${poolKey}/problems/${problemId}`,
    toAxiosConfig({ signal })
  );

const removeProblemFromPoolMutation = defineMutation<
  void,
  RemoveProblemFromPoolVariables
>({
  mutationFn: removeProblemFromPool,
  invalidateQueries: (_data, variables) => [
    ["problem-pools"],
    ["admin-problem-detail", variables.problemId],
    ["problem-pool-members", variables.poolKey],
    ["problem-pool-member-ids", variables.poolKey],
  ],
});

export const useRemoveProblemFromPool =
  removeProblemFromPoolMutation.useMutation;

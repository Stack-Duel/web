import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type AddProblemsToPoolVariables = {
  poolKey: string;
  problemIds: string[];
  selectAllMatching: boolean;
  search?: string;
  excludedProblemIds: string[];
};

export const addProblemsToPool = ({
  poolKey,
  problemIds,
  selectAllMatching,
  search,
  excludedProblemIds,
  signal,
}: AddProblemsToPoolVariables & RequestConfig) =>
  http.post<number>(
    `/api/v1/problempool/${poolKey}/problems/bulk`,
    { problemIds, selectAllMatching, search, excludedProblemIds },
    toAxiosConfig({ signal })
  );

const addProblemsToPoolMutation = defineMutation<
  number,
  AddProblemsToPoolVariables
>({
  mutationFn: addProblemsToPool,
  invalidateQueries: (_data, variables) => [
    ["problem-pools"],
    ["problem-pool-members", variables.poolKey],
    ["problem-pool-member-ids", variables.poolKey],
    ["admin-problems"],
  ],
});

export const useAddProblemsToPool = addProblemsToPoolMutation.useMutation;

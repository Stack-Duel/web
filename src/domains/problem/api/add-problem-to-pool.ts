import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type AddProblemToPoolVariables = {
  poolKey: string;
  problemId: string;
};

export const addProblemToPool = ({
  poolKey,
  problemId,
  signal,
}: AddProblemToPoolVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/problempool/${poolKey}/problems/${problemId}`,
    undefined,
    toAxiosConfig({ signal })
  );

const addProblemToPoolMutation = defineMutation<
  void,
  AddProblemToPoolVariables
>({
  mutationFn: addProblemToPool,
  invalidateQueries: (_data, variables) => [
    ["problem-pools"],
    ["admin-problem-detail", variables.problemId],
    ["problem-pool-members", variables.poolKey],
  ],
});

export const useAddProblemToPool = addProblemToPoolMutation.useMutation;

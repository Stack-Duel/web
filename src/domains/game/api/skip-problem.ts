import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type SkipProblemResult = {
  skipsRemaining: number;
  nextProblemId: string | null;
};

type SkipProblemVariables = {
  gameId: string;
  problemId: string;
};

export const skipProblem = ({
  gameId,
  problemId,
  signal,
}: SkipProblemVariables & RequestConfig) =>
  http.post<SkipProblemResult>(
    `/api/v1/game/${gameId}/problems/${problemId}/skip`,
    undefined,
    toAxiosConfig({ signal })
  );

const skipProblemMutation = defineMutation<
  SkipProblemResult,
  SkipProblemVariables
>({
  mutationFn: skipProblem,
});

export const useSkipProblem = skipProblemMutation.useMutation;

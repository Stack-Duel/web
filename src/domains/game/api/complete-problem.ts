import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type CompleteProblemResult = {
  newScore: number;
  nextProblemId: string | null;
};

type CompleteProblemVariables = {
  gameId: string;
  problemId: string;
  body: { submissionId: string };
};

export const completeProblem = ({
  gameId,
  problemId,
  body,
  signal,
}: CompleteProblemVariables & RequestConfig) =>
  http.post<CompleteProblemResult>(
    `/api/v1/game/${gameId}/problems/${problemId}/complete`,
    body,
    toAxiosConfig({ signal })
  );

const completeProblemMutation = defineMutation<
  CompleteProblemResult,
  CompleteProblemVariables
>({
  mutationFn: completeProblem,
});

export const useCompleteProblem = completeProblemMutation.useMutation;

import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type SubmitGameProblemVariables = {
  gameId: string;
  problemId: string;
  body: { problemSetupId: string; code: string };
};

export const submitGameProblem = ({
  gameId,
  problemId,
  body,
  signal,
}: SubmitGameProblemVariables & RequestConfig) =>
  http.post<string>(
    `/api/v1/game/${gameId}/problems/${problemId}/submit`,
    body,
    toAxiosConfig({ signal })
  );

const submitGameProblemMutation = defineMutation<
  string,
  SubmitGameProblemVariables
>({
  mutationFn: submitGameProblem,
});

export const useSubmitGameProblem = submitGameProblemMutation.useMutation;

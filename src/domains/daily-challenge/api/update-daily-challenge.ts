import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type UpdateDailyChallengeVariables = {
  date: string;
  problemId: string;
};

export const updateDailyChallenge = ({
  date,
  problemId,
  signal,
}: UpdateDailyChallengeVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/dailychallenge/admin/${date}`,
    { problemId },
    toAxiosConfig({ signal })
  );

const updateDailyChallengeMutation = defineMutation<
  void,
  UpdateDailyChallengeVariables
>({
  mutationFn: updateDailyChallenge,
  invalidateQueries: () => [["daily-challenge"]],
});

export const useUpdateDailyChallenge = updateDailyChallengeMutation.useMutation;

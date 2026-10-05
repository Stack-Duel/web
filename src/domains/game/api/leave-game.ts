import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type LeaveGameVariables = { gameId: string };

export const leaveGame = ({
  gameId,
  signal,
}: LeaveGameVariables & RequestConfig) =>
  http.post<void>(
    `/api/v1/game/${gameId}/leave`,
    undefined,
    toAxiosConfig({ signal })
  );

const leaveGameMutation = defineMutation<void, LeaveGameVariables>({
  mutationFn: leaveGame,
  invalidateQueries: (_data, { gameId }) => [
    ["game", gameId],
    ["open-games"],
    ["my-active-games"],
  ],
});

export const useLeaveGame = leaveGameMutation.useMutation;

import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type JoinGameVariables = { gameId: string };

export const joinGame = ({
  gameId,
  signal,
}: JoinGameVariables & RequestConfig) =>
  http.post<void>(
    `/api/v1/game/${gameId}/join`,
    undefined,
    toAxiosConfig({ signal })
  );

const joinGameMutation = defineMutation<void, JoinGameVariables>({
  mutationFn: joinGame,
  invalidateQueries: (_data, { gameId }) => [
    ["game", gameId],
    ["open-games"],
    ["my-active-games"],
  ],
});

export const useJoinGame = joinGameMutation.useMutation;

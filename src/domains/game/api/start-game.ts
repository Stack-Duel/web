import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type StartGameVariables = { gameId: string };

export const startGame = ({
  gameId,
  signal,
}: StartGameVariables & RequestConfig) =>
  http.post<void>(
    `/api/v1/game/${gameId}/start`,
    undefined,
    toAxiosConfig({ signal })
  );

const startGameMutation = defineMutation<void, StartGameVariables>({
  mutationFn: startGame,
  invalidateQueries: (_data, { gameId }) => [
    ["game", gameId],
    ["my-active-games"],
  ],
});

export const useStartGame = startGameMutation.useMutation;

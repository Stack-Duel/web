import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type ForfeitGameVariables = { gameId: string };

export const forfeitGame = ({
  gameId,
  signal,
}: ForfeitGameVariables & RequestConfig) =>
  http.post<void>(
    `/api/v1/game/${gameId}/forfeit`,
    undefined,
    toAxiosConfig({ signal })
  );

const forfeitGameMutation = defineMutation<void, ForfeitGameVariables>({
  mutationFn: forfeitGame,
  invalidateQueries: (_data, { gameId }) => [
    ["game", gameId],
    ["my-active-games"],
  ],
});

export const useForfeitGame = forfeitGameMutation.useMutation;

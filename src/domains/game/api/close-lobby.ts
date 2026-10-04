import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type CloseLobbyVariables = { gameId: string };

export const closeLobby = ({
  gameId,
  signal,
}: CloseLobbyVariables & RequestConfig) =>
  http.post<void>(
    `/api/v1/game/${gameId}/close`,
    undefined,
    toAxiosConfig({ signal })
  );

const closeLobbyMutation = defineMutation<void, CloseLobbyVariables>({
  mutationFn: closeLobby,
  invalidateQueries: (_data, { gameId }) => [
    ["game", gameId],
    ["open-games"],
    ["my-active-games"],
  ],
});

export const useCloseLobby = closeLobbyMutation.useMutation;

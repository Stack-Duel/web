import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { Game } from "../models/game";

type GetGameParams = { gameId: string };

export const getGame = ({ gameId, signal }: GetGameParams & RequestConfig) =>
  http.get<Game>(`/api/v1/game/${gameId}`, toAxiosConfig({ signal }));

const gameQuery = defineQuery<Game, GetGameParams>({
  queryKey: ({ gameId }) => ["game", gameId],
  queryFn: getGame,
});

export const useGame = gameQuery.useQuery;
export const gameQueryOptions = gameQuery.queryOptions;

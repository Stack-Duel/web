import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import { defineQuery } from "@/shared/api/define-query";
import type { GameLobbySummary } from "../models/game-lobby";
import type { GameModeKey } from "../models/game-mode";

type GetOpenGamesParams = {
  gameModeKey?: GameModeKey;
  page: number;
  size: number;
};

export const getOpenGames = ({
  gameModeKey,
  page,
  size,
  signal,
}: GetOpenGamesParams & RequestConfig) =>
  http.get<PageResult<GameLobbySummary>>("/api/v1/game", {
    ...toAxiosConfig({ signal }),
    params: { gameModeKey, page, size },
  });

const openGamesQuery = defineQuery<
  PageResult<GameLobbySummary>,
  GetOpenGamesParams
>({
  queryKey: ({ gameModeKey, page, size }) => [
    "open-games",
    gameModeKey ?? "all",
    page,
    size,
  ],
  queryFn: getOpenGames,
  meta: { errorToast: "Error loading games" },
});

export const openGamesQueryOptions = openGamesQuery.queryOptions;

/** Polls so lobbies filling up / disappearing (started elsewhere) stay
 *  roughly live without building real-time sync for this pass. */
export function useOpenGames(params: GetOpenGamesParams) {
  return openGamesQuery.useQuery({
    ...params,
    queryConfig: { refetchInterval: 5_000 },
  });
}

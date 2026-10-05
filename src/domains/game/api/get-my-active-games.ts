import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { MyActiveGame } from "../models/my-active-game";

export const getMyActiveGames = ({ signal }: RequestConfig) =>
  http.get<MyActiveGame[]>("/api/v1/game/mine", toAxiosConfig({ signal }));

const myActiveGamesQuery = defineQuery({
  queryKey: () => ["my-active-games"],
  queryFn: getMyActiveGames,
});

export const myActiveGamesQueryOptions = myActiveGamesQuery.queryOptions;

export function useMyActiveGames(enabled: boolean) {
  return myActiveGamesQuery.useQuery({
    queryConfig: { refetchInterval: 30_000, enabled },
  });
}

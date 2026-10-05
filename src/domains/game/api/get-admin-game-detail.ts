import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { Game } from "../models/game";

type GetAdminGameDetailParams = { gameId: string };

export const getAdminGameDetail = ({
  gameId,
  signal,
}: GetAdminGameDetailParams & RequestConfig) =>
  http.get<Game>(`/api/v1/game/admin/${gameId}`, toAxiosConfig({ signal }));

const adminGameDetailQuery = defineQuery<Game, GetAdminGameDetailParams>({
  queryKey: ({ gameId }) => ["admin-game-detail", gameId],
  queryFn: getAdminGameDetail,
  meta: { errorToast: "Error loading game detail" },
});

export const useAdminGameDetail = adminGameDetailQuery.useQuery;

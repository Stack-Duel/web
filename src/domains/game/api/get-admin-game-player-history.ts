import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { AdminGamePlayerHistory } from "../models/admin-game-history";

type GetAdminGamePlayerHistoryParams = { gameId: string };

export const getAdminGamePlayerHistory = ({
  gameId,
  signal,
}: GetAdminGamePlayerHistoryParams & RequestConfig) =>
  http.get<AdminGamePlayerHistory[]>(
    `/api/v1/game/admin/${gameId}/history`,
    toAxiosConfig({ signal })
  );

const adminGamePlayerHistoryQuery = defineQuery<
  AdminGamePlayerHistory[],
  GetAdminGamePlayerHistoryParams
>({
  queryKey: ({ gameId }) => ["admin-game-player-history", gameId],
  queryFn: getAdminGamePlayerHistory,
  meta: { errorToast: "Error loading player history" },
});

export const useAdminGamePlayerHistory = adminGamePlayerHistoryQuery.useQuery;

import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type { AdminGameListItem } from "../models/admin-game";
import type { GameStatus } from "../models/game";

type GetAdminGamesParams = {
  page: number;
  size: number;
  timestamp: string;
  status?: GameStatus;
};

export const getAdminGames = ({
  page,
  size,
  timestamp,
  status,
  signal,
}: GetAdminGamesParams & RequestConfig) =>
  http.get<PageResult<AdminGameListItem>>("/api/v1/game/admin", {
    ...toAxiosConfig({ signal }),
    params: { page, size, timestamp, status },
  });

const adminGamesQuery = defineQuery<
  PageResult<AdminGameListItem>,
  GetAdminGamesParams
>({
  queryKey: ({ page, size, timestamp, status }) => [
    "admin-games",
    page,
    size,
    timestamp,
    status ?? null,
  ],
  queryFn: getAdminGames,
  meta: { errorToast: "Error loading games" },
});

export const useAdminGames = adminGamesQuery.useQuery;

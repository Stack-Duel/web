import { toAxiosConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { UserGameStats } from "../models/user-profile";
import { http } from "@/shared/lib/http";

type GetUserGameStatsParams = { username: string };

export const getUserGameStats = ({
  username,
  signal,
}: GetUserGameStatsParams & RequestConfig) =>
  http.get<UserGameStats>(
    `/api/v1/user/profile/${encodeURIComponent(username)}/stats`,
    toAxiosConfig({ signal })
  );

const userGameStatsQuery = defineQuery<UserGameStats, GetUserGameStatsParams>({
  queryKey: ({ username }) => ["user-game-stats", username],
  queryFn: getUserGameStats,
});

export const useUserGameStats = userGameStatsQuery.useQuery;

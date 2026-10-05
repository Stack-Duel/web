import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import { defineQuery } from "@/shared/api/define-query";
import type { LeaderboardEntry } from "../models/leaderboard-entry";
import type { GameModeKey } from "@/domains/game/models/game-mode";

type GetLeaderboardParams = {
  gameModeKey: GameModeKey;
  timeLimitInSeconds: number;
  page: number;
  size: number;
};

export const getLeaderboard = ({
  gameModeKey,
  timeLimitInSeconds,
  page,
  size,
  signal,
}: GetLeaderboardParams & RequestConfig) =>
  http.get<PageResult<LeaderboardEntry>>("/api/v1/leaderboard", {
    ...toAxiosConfig({ signal }),
    params: { gameModeKey, timeLimitInSeconds, page, size },
  });

const leaderboardQuery = defineQuery<
  PageResult<LeaderboardEntry>,
  GetLeaderboardParams
>({
  queryKey: ({ gameModeKey, timeLimitInSeconds, page, size }) => [
    "leaderboard",
    gameModeKey,
    timeLimitInSeconds,
    page,
    size,
  ],
  queryFn: getLeaderboard,
  meta: { errorToast: "Error loading leaderboard" },
});

export const useLeaderboard = leaderboardQuery.useQuery;

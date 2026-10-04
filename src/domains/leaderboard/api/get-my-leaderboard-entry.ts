import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { GameModeKey } from "@/domains/game/models/game-mode";

export type MyLeaderboardEntry = {
  highScore: number;
};

type GetMyLeaderboardEntryParams = {
  gameModeKey: GameModeKey;
  timeLimitInSeconds: number;
};

export const getMyLeaderboardEntry = ({
  gameModeKey,
  timeLimitInSeconds,
  signal,
}: GetMyLeaderboardEntryParams & RequestConfig) =>
  http.get<MyLeaderboardEntry>("/api/v1/leaderboard/me", {
    ...toAxiosConfig({ signal }),
    params: { gameModeKey, timeLimitInSeconds },
  });

const myLeaderboardEntryQuery = defineQuery<
  MyLeaderboardEntry,
  GetMyLeaderboardEntryParams
>({
  queryKey: ({ gameModeKey, timeLimitInSeconds }) => [
    "leaderboard",
    "me",
    gameModeKey,
    timeLimitInSeconds,
  ],
  queryFn: getMyLeaderboardEntry,
});

export const useMyLeaderboardEntry = myLeaderboardEntryQuery.useQuery;

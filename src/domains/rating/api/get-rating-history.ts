import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { RatingHistoryEntry } from "../models/rating-history";
import type { GameModeKey } from "@/domains/game/models/game-mode";

type GetRatingHistoryParams = { gameModeKey: GameModeKey };

export const getRatingHistory = ({
  gameModeKey,
  signal,
}: GetRatingHistoryParams & RequestConfig) =>
  http.get<RatingHistoryEntry[]>("/api/v1/rating/me/history", {
    ...toAxiosConfig({ signal }),
    params: { gameModeKey },
  });

const ratingHistoryQuery = defineQuery<
  RatingHistoryEntry[],
  GetRatingHistoryParams
>({
  queryKey: ({ gameModeKey }) => ["rating-history", gameModeKey],
  queryFn: getRatingHistory,
  meta: { errorToast: "Error loading rating history" },
});

export const useRatingHistory = ratingHistoryQuery.useQuery;

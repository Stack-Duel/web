import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { GameProblemHistory } from "../models/game";

type GetGameProblemHistoryParams = { gameId: string };

export const getGameProblemHistory = ({
  gameId,
  signal,
}: GetGameProblemHistoryParams & RequestConfig) =>
  http.get<GameProblemHistory[]>(
    `/api/v1/game/${gameId}/problems`,
    toAxiosConfig({ signal })
  );

const gameProblemHistoryQuery = defineQuery<
  GameProblemHistory[],
  GetGameProblemHistoryParams
>({
  queryKey: ({ gameId }) => ["game-problem-history", gameId],
  queryFn: getGameProblemHistory,
  meta: { errorToast: "Failed to load problem history" },
});

export const useGameProblemHistory = gameProblemHistoryQuery.useQuery;
export const gameProblemHistoryQueryOptions =
  gameProblemHistoryQuery.queryOptions;

import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";

export type DuelHeadToHeadRecord = {
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
};

type GetDuelHeadToHeadParams = { opponentId: string };

export const getDuelHeadToHead = ({
  opponentId,
  signal,
}: GetDuelHeadToHeadParams & RequestConfig) =>
  http.get<DuelHeadToHeadRecord>(
    `/api/v1/game/duel-record/${opponentId}`,
    toAxiosConfig({ signal })
  );

const duelHeadToHeadQuery = defineQuery<
  DuelHeadToHeadRecord,
  GetDuelHeadToHeadParams
>({
  queryKey: ({ opponentId }) => ["duel-head-to-head", opponentId],
  queryFn: getDuelHeadToHead,
});

export const useDuelHeadToHead = duelHeadToHeadQuery.useQuery;

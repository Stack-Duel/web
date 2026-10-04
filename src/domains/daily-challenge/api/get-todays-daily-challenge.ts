import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { TodaysDailyChallenge } from "../models/daily-challenge";

export const getTodaysDailyChallenge = ({ signal }: RequestConfig) =>
  http.get<TodaysDailyChallenge>(
    "/api/v1/dailychallenge/today",
    toAxiosConfig({ signal })
  );

const todaysDailyChallengeQuery = defineQuery({
  queryKey: () => ["daily-challenge", "today"],
  queryFn: getTodaysDailyChallenge,
});

export const useTodaysDailyChallenge = todaysDailyChallengeQuery.useQuery;

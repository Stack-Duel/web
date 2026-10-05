import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { UpcomingDailyChallenge } from "../models/upcoming-daily-challenge";

export const getUpcomingDailyChallenges = ({ signal }: RequestConfig) =>
  http.get<UpcomingDailyChallenge[]>(
    "/api/v1/dailychallenge/admin/upcoming",
    toAxiosConfig({ signal })
  );

const upcomingDailyChallengesQuery = defineQuery({
  queryKey: () => ["daily-challenge", "upcoming"],
  queryFn: getUpcomingDailyChallenges,
  meta: { errorToast: "Error loading upcoming daily challenges" },
});

export const useUpcomingDailyChallenges = upcomingDailyChallengesQuery.useQuery;

import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { UserDashboardStats } from "../models/user-dashboard-stats";

export const getMyDashboardStats = ({ signal }: RequestConfig = {}) =>
  http.get<UserDashboardStats>(
    "/api/v1/dashboard/me",
    toAxiosConfig({ signal })
  );

const myDashboardStatsQuery = defineQuery<UserDashboardStats>({
  queryKey: () => ["my-dashboard-stats"],
  queryFn: getMyDashboardStats,
  meta: { errorToast: "Error loading your stats" },
});

export const useMyDashboardStats = myDashboardStatsQuery.useQuery;

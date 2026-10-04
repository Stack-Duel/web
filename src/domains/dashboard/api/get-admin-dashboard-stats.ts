import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { AdminDashboardStats } from "../models/admin-dashboard-stats";

export const getAdminDashboardStats = ({ signal }: RequestConfig = {}) =>
  http.get<AdminDashboardStats>(
    "/api/v1/dashboard/admin",
    toAxiosConfig({ signal })
  );

const adminDashboardStatsQuery = defineQuery<AdminDashboardStats>({
  queryKey: () => ["admin-dashboard-stats"],
  queryFn: getAdminDashboardStats,
  meta: { errorToast: "Error loading dashboard stats" },
});

export const useAdminDashboardStats = adminDashboardStatsQuery.useQuery;

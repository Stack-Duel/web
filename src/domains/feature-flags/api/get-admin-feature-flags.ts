import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { FeatureFlagAdmin } from "../models/feature-flag-admin";

export const getAdminFeatureFlags = ({ signal }: RequestConfig) =>
  http.get<FeatureFlagAdmin[]>(
    "/api/v1/feature-flag/admin",
    toAxiosConfig({ signal })
  );

const adminFeatureFlagsQuery = defineQuery({
  queryKey: () => ["admin-feature-flags"],
  queryFn: getAdminFeatureFlags,
  meta: { errorToast: "Error loading feature flags" },
});

export const useAdminFeatureFlags = adminFeatureFlagsQuery.useQuery;

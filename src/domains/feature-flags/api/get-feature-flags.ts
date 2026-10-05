import { toAxiosConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { FeatureFlags } from "../models/feature-flags";
import { http } from "@/shared/lib/http";

export const getFeatureFlags = ({ signal }: RequestConfig) =>
  http.get<FeatureFlags>("/api/v1/feature-flag", toAxiosConfig({ signal }));

const featureFlagsQuery = defineQuery({
  queryKey: () => ["feature-flags"],
  queryFn: getFeatureFlags,
});

export const useFeatureFlags = featureFlagsQuery.useQuery;
export const featureFlagsQueryOptions = featureFlagsQuery.queryOptions;

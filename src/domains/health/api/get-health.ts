import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { RequestConfig, toAxiosConfig } from "@/shared/lib/request-config";

export const getHealth = ({ signal }: RequestConfig) =>
  http.get<{ status: string; timestamp: string }>(
    "/api/v1/health",
    toAxiosConfig({ signal })
  );

const healthQuery = defineQuery({
  queryKey: () => ["health"],
  queryFn: getHealth,
});

export const useHealth = healthQuery.useQuery;

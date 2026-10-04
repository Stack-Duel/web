import { toAxiosConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { User } from "../models/user";
import { http } from "@/shared/lib/http";

export const getAccount = ({ signal }: RequestConfig) =>
  http.get<User>("/api/v1/user", toAxiosConfig({ signal }));

const accountQuery = defineQuery({
  queryKey: () => ["account"],
  queryFn: getAccount,
});

export const useAccount = accountQuery.useQuery;
export const useSuspenseAccount = accountQuery.useSuspenseQuery;
export const accountQueryOptions = accountQuery.queryOptions;

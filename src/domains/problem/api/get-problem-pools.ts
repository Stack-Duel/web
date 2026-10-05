import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { ProblemPool } from "../models/problem-pool";

export const getProblemPools = ({ signal }: RequestConfig) =>
  http.get<ProblemPool[]>("/api/v1/problempool", toAxiosConfig({ signal }));

const problemPoolsQuery = defineQuery({
  queryKey: () => ["problem-pools"],
  queryFn: getProblemPools,
  meta: { errorToast: "Error loading problem pools" },
});

export const useProblemPools = problemPoolsQuery.useQuery;

import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { MyProblemsMetadata } from "../models/my-problems-metadata";

export const getMyProblemsMetadata = ({ signal }: RequestConfig) =>
  http.get<MyProblemsMetadata>(
    "/api/v1/problem/mine/metadata",
    toAxiosConfig({ signal })
  );

const myProblemsMetadataQuery = defineQuery<MyProblemsMetadata>({
  queryKey: () => ["my-problems-metadata"],
  queryFn: getMyProblemsMetadata,
  meta: { errorToast: "Error loading your problem stats" },
});

export const useMyProblemsMetadata = myProblemsMetadataQuery.useQuery;

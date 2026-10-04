import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { AdminProblemDetail } from "../models/admin-problem";

type GetAdminProblemDetailParams = {
  id: string;
};

export const getAdminProblemDetail = ({
  id,
  signal,
}: GetAdminProblemDetailParams & RequestConfig) =>
  http.get<AdminProblemDetail>(
    `/api/v1/problem/admin/${id}`,
    toAxiosConfig({ signal })
  );

const adminProblemDetailQuery = defineQuery<
  AdminProblemDetail,
  GetAdminProblemDetailParams
>({
  queryKey: ({ id }) => ["admin-problem-detail", id],
  queryFn: getAdminProblemDetail,
  meta: { errorToast: "Error loading problem detail" },
});

export const useAdminProblemDetail = adminProblemDetailQuery.useQuery;

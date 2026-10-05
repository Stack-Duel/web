import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { AdminUserDetail } from "../models/admin-user-detail";

type GetAdminUserDetailParams = {
  id: string;
};

export const getAdminUserDetail = ({
  id,
  signal,
}: GetAdminUserDetailParams & RequestConfig) =>
  http.get<AdminUserDetail>(
    `/api/v1/user/admin/${id}`,
    toAxiosConfig({ signal })
  );

const adminUserDetailQuery = defineQuery<
  AdminUserDetail,
  GetAdminUserDetailParams
>({
  queryKey: ({ id }) => ["admin-user-detail", id],
  queryFn: getAdminUserDetail,
  meta: { errorToast: "Error loading user detail" },
});

export const useAdminUserDetail = adminUserDetailQuery.useQuery;

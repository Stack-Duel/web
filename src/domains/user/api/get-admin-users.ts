import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type { AdminUser } from "../models/admin-user";

type GetAdminUsersParams = {
  page: number;
  size: number;
  timestamp: string;
  search?: string;
};

export const getAdminUsers = ({
  page,
  size,
  timestamp,
  search,
  signal,
}: GetAdminUsersParams & RequestConfig) =>
  http.get<PageResult<AdminUser>>("/api/v1/user/admin", {
    ...toAxiosConfig({ signal }),
    params: { page, size, timestamp, search },
  });

const adminUsersQuery = defineQuery<PageResult<AdminUser>, GetAdminUsersParams>(
  {
    queryKey: ({ page, size, timestamp, search }) => [
      "admin-users",
      page,
      size,
      timestamp,
      search,
    ],
    queryFn: getAdminUsers,
    meta: { errorToast: "Error loading users" },
  }
);

export const useAdminUsers = adminUsersQuery.useQuery;

import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type { AuditLogEntry } from "../models/audit-log-entry";

type GetAdminAuditLogParams = {
  page: number;
  size: number;
  timestamp: string;
};

export const getAdminAuditLog = ({
  page,
  size,
  timestamp,
  signal,
}: GetAdminAuditLogParams & RequestConfig) =>
  http.get<PageResult<AuditLogEntry>>("/api/v1/audit-log", {
    ...toAxiosConfig({ signal }),
    params: { page, size, timestamp },
  });

const adminAuditLogQuery = defineQuery<
  PageResult<AuditLogEntry>,
  GetAdminAuditLogParams
>({
  queryKey: ({ page, size, timestamp }) => [
    "admin-audit-log",
    page,
    size,
    timestamp,
  ],
  queryFn: getAdminAuditLog,
  meta: { errorToast: "Error loading audit log" },
});

export const useAdminAuditLog = adminAuditLogQuery.useQuery;

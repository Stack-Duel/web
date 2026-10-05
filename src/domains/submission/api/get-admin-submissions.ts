import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type { AdminSubmissionListItem } from "../models/admin-submission";

type GetAdminSubmissionsParams = {
  page: number;
  size: number;
  timestamp: string;
  id?: string;
};

export const getAdminSubmissions = ({
  page,
  size,
  timestamp,
  id,
  signal,
}: GetAdminSubmissionsParams & RequestConfig) =>
  http.get<PageResult<AdminSubmissionListItem>>("/api/v1/submission/admin", {
    ...toAxiosConfig({ signal }),
    params: { page, size, timestamp, id },
  });

const adminSubmissionsQuery = defineQuery<
  PageResult<AdminSubmissionListItem>,
  GetAdminSubmissionsParams
>({
  queryKey: ({ page, size, timestamp, id }) => [
    "admin-submissions",
    page,
    size,
    timestamp,
    id ?? null,
  ],
  queryFn: getAdminSubmissions,
  meta: { errorToast: "Error loading submissions" },
});

export const useAdminSubmissions = adminSubmissionsQuery.useQuery;

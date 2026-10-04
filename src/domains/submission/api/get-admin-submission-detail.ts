import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { AdminSubmissionDetail } from "../models/admin-submission";

type GetAdminSubmissionDetailParams = {
  id: string;
};

export const getAdminSubmissionDetail = ({
  id,
  signal,
}: GetAdminSubmissionDetailParams & RequestConfig) =>
  http.get<AdminSubmissionDetail>(
    `/api/v1/submission/admin/${id}`,
    toAxiosConfig({ signal })
  );

const adminSubmissionDetailQuery = defineQuery<
  AdminSubmissionDetail,
  GetAdminSubmissionDetailParams
>({
  queryKey: ({ id }) => ["admin-submission-detail", id],
  queryFn: getAdminSubmissionDetail,
  meta: { errorToast: "Error loading submission detail" },
});

export const useAdminSubmissionDetail = adminSubmissionDetailQuery.useQuery;

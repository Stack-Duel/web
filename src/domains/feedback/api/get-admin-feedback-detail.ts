import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { AdminFeedbackDetail } from "../models/feedback";

type GetAdminFeedbackDetailParams = {
  id: string;
};

export const getAdminFeedbackDetail = ({
  id,
  signal,
}: GetAdminFeedbackDetailParams & RequestConfig) =>
  http.get<AdminFeedbackDetail>(
    `/api/v1/feedback/admin/${id}`,
    toAxiosConfig({ signal })
  );

const adminFeedbackDetailQuery = defineQuery<
  AdminFeedbackDetail,
  GetAdminFeedbackDetailParams
>({
  queryKey: ({ id }) => ["admin-feedback-detail", id],
  queryFn: getAdminFeedbackDetail,
  meta: { errorToast: "Error loading feedback detail" },
});

export const useAdminFeedbackDetail = adminFeedbackDetailQuery.useQuery;

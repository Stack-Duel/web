import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type {
  AdminFeedbackListItem,
  FeedbackStatus,
  FeedbackType,
} from "../models/feedback";

type GetAdminFeedbackParams = {
  page: number;
  size: number;
  timestamp: string;
  type?: FeedbackType;
  status?: FeedbackStatus;
};

export const getAdminFeedback = ({
  page,
  size,
  timestamp,
  type,
  status,
  signal,
}: GetAdminFeedbackParams & RequestConfig) =>
  http.get<PageResult<AdminFeedbackListItem>>("/api/v1/feedback/admin", {
    ...toAxiosConfig({ signal }),
    params: { page, size, timestamp, type, status },
  });

const adminFeedbackQuery = defineQuery<
  PageResult<AdminFeedbackListItem>,
  GetAdminFeedbackParams
>({
  queryKey: ({ page, size, timestamp, type, status }) => [
    "admin-feedback",
    page,
    size,
    timestamp,
    type ?? null,
    status ?? null,
  ],
  queryFn: getAdminFeedback,
  meta: { errorToast: "Error loading feedback" },
});

export const useAdminFeedback = adminFeedbackQuery.useQuery;

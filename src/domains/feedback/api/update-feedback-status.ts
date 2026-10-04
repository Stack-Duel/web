import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { FeedbackStatus } from "../models/feedback";

type UpdateFeedbackStatusPayload = {
  id: string;
  status: FeedbackStatus;
  adminNote: string | null;
};

export const updateFeedbackStatus = ({
  id,
  signal,
  ...body
}: UpdateFeedbackStatusPayload & RequestConfig) =>
  http.patch<void>(
    `/api/v1/feedback/admin/${id}/status`,
    body,
    toAxiosConfig({ signal })
  );

const updateFeedbackStatusMutation = defineMutation<
  void,
  UpdateFeedbackStatusPayload
>({
  mutationFn: updateFeedbackStatus,
  invalidateQueries: (_, variables) => [
    ["admin-feedback-detail", variables.id],
    ["admin-feedback"],
  ],
});

export const useUpdateFeedbackStatus = updateFeedbackStatusMutation.useMutation;

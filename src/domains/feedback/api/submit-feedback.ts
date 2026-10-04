import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { SubmitFeedbackPayload } from "../models/feedback";

export const submitFeedback = ({
  signal,
  ...body
}: SubmitFeedbackPayload & RequestConfig) =>
  http.post<string>("/api/v1/feedback", body, toAxiosConfig({ signal }));

const submitFeedbackMutation = defineMutation<string, SubmitFeedbackPayload>({
  mutationFn: submitFeedback,
});

export const useSubmitFeedback = submitFeedbackMutation.useMutation;

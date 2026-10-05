import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { CreateRunSubmissionRequest } from "../models/submission-status";

export const createRunSubmission = ({
  signal,
  ...body
}: CreateRunSubmissionRequest & RequestConfig) =>
  http.post<string>("/api/v1/submission/run", body, toAxiosConfig({ signal }));

const createRunSubmissionMutation = defineMutation<
  string,
  CreateRunSubmissionRequest
>({
  mutationFn: createRunSubmission,
});

export const useCreateRunSubmission = createRunSubmissionMutation.useMutation;

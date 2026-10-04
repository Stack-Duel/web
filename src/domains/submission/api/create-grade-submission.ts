import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { CreateGradeSubmissionRequest } from "../models/submission-status";

export const createGradeSubmission = ({
  signal,
  ...body
}: CreateGradeSubmissionRequest & RequestConfig) =>
  http.post<string>(
    "/api/v1/submission/grade",
    body,
    toAxiosConfig({ signal })
  );

const createGradeSubmissionMutation = defineMutation<
  string,
  CreateGradeSubmissionRequest
>({
  mutationFn: createGradeSubmission,
});

export const useCreateGradeSubmission =
  createGradeSubmissionMutation.useMutation;

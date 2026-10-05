import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { ProblemStatus } from "../models/admin-problem";

type UpdateAdminProblemVariables = {
  id: string;
  title: string;
  question: string;
  difficulty: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
  status?: ProblemStatus;
};

export const updateAdminProblem = ({
  id,
  title,
  question,
  difficulty,
  timeLimitMs,
  memoryLimitMb,
  tags,
  status,
  signal,
}: UpdateAdminProblemVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/problem/admin/${id}`,
    { title, question, difficulty, timeLimitMs, memoryLimitMb, tags, status },
    toAxiosConfig({ signal })
  );

const updateAdminProblemMutation = defineMutation<
  void,
  UpdateAdminProblemVariables
>({
  mutationFn: updateAdminProblem,
  invalidateQueries: (_data, variables) => [
    ["admin-problems"],
    ["admin-problem-detail", variables.id],
  ],
});

export const useUpdateAdminProblem = updateAdminProblemMutation.useMutation;

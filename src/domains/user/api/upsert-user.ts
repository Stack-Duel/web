import { toAxiosConfig } from "@/shared/lib/request-config";
import { defineMutation } from "@/shared/api/define-mutation";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { User } from "../models/user";
import { http } from "@/shared/lib/http";

type UpsertUserVariables = { sub: string; tenantId?: string };

export const upsertUser = ({
  signal,
  ...data
}: UpsertUserVariables & RequestConfig) =>
  http.put<User>("/api/v1/user", data, toAxiosConfig({ signal }));

const upsertUserMutation = defineMutation<User, UpsertUserVariables>({
  mutationFn: upsertUser,
  invalidateQueries: () => [["account"]],
});

export const useUpsertUser = upsertUserMutation.useMutation;

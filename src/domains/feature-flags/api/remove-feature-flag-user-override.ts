import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type RemoveFeatureFlagUserOverrideVariables = {
  id: string;
  userId: string;
};

export const removeFeatureFlagUserOverride = ({
  id,
  userId,
  signal,
}: RemoveFeatureFlagUserOverrideVariables & RequestConfig) =>
  http.delete<void>(
    `/api/v1/feature-flag/admin/${id}/user-overrides/${userId}`,
    toAxiosConfig({ signal })
  );

const removeFeatureFlagUserOverrideMutation = defineMutation<
  void,
  RemoveFeatureFlagUserOverrideVariables
>({
  mutationFn: removeFeatureFlagUserOverride,
  invalidateQueries: () => [["admin-feature-flags"]],
});

export const useRemoveFeatureFlagUserOverride =
  removeFeatureFlagUserOverrideMutation.useMutation;

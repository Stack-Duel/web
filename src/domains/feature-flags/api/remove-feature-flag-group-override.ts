import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type RemoveFeatureFlagGroupOverrideVariables = {
  id: string;
  groupId: string;
};

export const removeFeatureFlagGroupOverride = ({
  id,
  groupId,
  signal,
}: RemoveFeatureFlagGroupOverrideVariables & RequestConfig) =>
  http.delete<void>(
    `/api/v1/feature-flag/admin/${id}/group-overrides/${groupId}`,
    toAxiosConfig({ signal })
  );

const removeFeatureFlagGroupOverrideMutation = defineMutation<
  void,
  RemoveFeatureFlagGroupOverrideVariables
>({
  mutationFn: removeFeatureFlagGroupOverride,
  invalidateQueries: () => [["admin-feature-flags"]],
});

export const useRemoveFeatureFlagGroupOverride =
  removeFeatureFlagGroupOverrideMutation.useMutation;

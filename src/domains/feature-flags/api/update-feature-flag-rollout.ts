import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type UpdateFeatureFlagRolloutVariables = {
  id: string;
  rolloutPercentage: number;
};

export const updateFeatureFlagRollout = ({
  id,
  rolloutPercentage,
  signal,
}: UpdateFeatureFlagRolloutVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/feature-flag/admin/${id}/rollout`,
    { rolloutPercentage },
    toAxiosConfig({ signal })
  );

const updateFeatureFlagRolloutMutation = defineMutation<
  void,
  UpdateFeatureFlagRolloutVariables
>({
  mutationFn: updateFeatureFlagRollout,
  invalidateQueries: () => [["admin-feature-flags"]],
});

export const useUpdateFeatureFlagRollout =
  updateFeatureFlagRolloutMutation.useMutation;

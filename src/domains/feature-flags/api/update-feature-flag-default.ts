import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type UpdateFeatureFlagDefaultVariables = {
  id: string;
  defaultEnabled: boolean;
};

export const updateFeatureFlagDefault = ({
  id,
  defaultEnabled,
  signal,
}: UpdateFeatureFlagDefaultVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/feature-flag/admin/${id}/default`,
    { defaultEnabled },
    toAxiosConfig({ signal })
  );

const updateFeatureFlagDefaultMutation = defineMutation<
  void,
  UpdateFeatureFlagDefaultVariables
>({
  mutationFn: updateFeatureFlagDefault,
  invalidateQueries: () => [["admin-feature-flags"]],
});

export const useUpdateFeatureFlagDefault =
  updateFeatureFlagDefaultMutation.useMutation;

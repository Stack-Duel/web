import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { DecisionEffect } from "../models/feature-flag-admin";

export type SetFeatureFlagGroupOverrideVariables = {
  id: string;
  groupId: string;
  effect: DecisionEffect;
};

export const setFeatureFlagGroupOverride = ({
  id,
  groupId,
  effect,
  signal,
}: SetFeatureFlagGroupOverrideVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/feature-flag/admin/${id}/group-overrides/${groupId}`,
    { effect },
    toAxiosConfig({ signal })
  );

const setFeatureFlagGroupOverrideMutation = defineMutation<
  void,
  SetFeatureFlagGroupOverrideVariables
>({
  mutationFn: setFeatureFlagGroupOverride,
  invalidateQueries: () => [["admin-feature-flags"]],
});

export const useSetFeatureFlagGroupOverride =
  setFeatureFlagGroupOverrideMutation.useMutation;

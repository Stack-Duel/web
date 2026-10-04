import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { DecisionEffect } from "../models/feature-flag-admin";

export type SetFeatureFlagUserOverrideVariables = {
  id: string;
  userId: string;
  effect: DecisionEffect;
};

export const setFeatureFlagUserOverride = ({
  id,
  userId,
  effect,
  signal,
}: SetFeatureFlagUserOverrideVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/feature-flag/admin/${id}/user-overrides/${userId}`,
    { effect },
    toAxiosConfig({ signal })
  );

const setFeatureFlagUserOverrideMutation = defineMutation<
  void,
  SetFeatureFlagUserOverrideVariables
>({
  mutationFn: setFeatureFlagUserOverride,
  invalidateQueries: () => [["admin-feature-flags"]],
});

export const useSetFeatureFlagUserOverride =
  setFeatureFlagUserOverrideMutation.useMutation;

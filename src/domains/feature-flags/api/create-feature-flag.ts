import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type CreateFeatureFlagVariables = {
  key: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
};

export const createFeatureFlag = ({
  key,
  name,
  description,
  defaultEnabled,
  signal,
}: CreateFeatureFlagVariables & RequestConfig) =>
  http.post<string>(
    "/api/v1/feature-flag/admin",
    { key, name, description, defaultEnabled },
    toAxiosConfig({ signal })
  );

const createFeatureFlagMutation = defineMutation<
  string,
  CreateFeatureFlagVariables
>({
  mutationFn: createFeatureFlag,
  invalidateQueries: () => [["admin-feature-flags"]],
});

export const useCreateFeatureFlag = createFeatureFlagMutation.useMutation;

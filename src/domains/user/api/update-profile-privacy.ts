import { toAxiosConfig } from "@/shared/lib/request-config";
import { defineMutation } from "@/shared/api/define-mutation";
import type { RequestConfig } from "@/shared/lib/request-config";
import { http } from "@/shared/lib/http";

type UpdateProfilePrivacyVariables = { isPrivate: boolean };

export const updateProfilePrivacy = ({
  signal,
  ...data
}: UpdateProfilePrivacyVariables & RequestConfig) =>
  http.put<void>(
    "/api/v1/user/profile-privacy",
    data,
    toAxiosConfig({ signal })
  );

const updateProfilePrivacyMutation = defineMutation<
  void,
  UpdateProfilePrivacyVariables
>({
  mutationFn: updateProfilePrivacy,
  invalidateQueries: () => [["user-profile"], ["account"]],
});

export const useUpdateProfilePrivacy = updateProfilePrivacyMutation.useMutation;

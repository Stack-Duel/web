import { toAxiosConfig } from "@/shared/lib/request-config";
import { defineMutation } from "@/shared/api/define-mutation";
import type { RequestConfig } from "@/shared/lib/request-config";
import { http } from "@/shared/lib/http";

type SelectAvatarVariables = { avatarId: string };

export const selectAvatar = ({
  signal,
  avatarId,
}: SelectAvatarVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/user/avatar/${avatarId}`,
    undefined,
    toAxiosConfig({ signal })
  );

const selectAvatarMutation = defineMutation<void, SelectAvatarVariables>({
  mutationFn: selectAvatar,
  invalidateQueries: () => [["account"], ["avatar-history"]],
});

export const useSelectAvatar = selectAvatarMutation.useMutation;

import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type UpdateUserGroupsVariables = {
  userId: string;
  groupIds: string[];
};

export const updateUserGroups = ({
  userId,
  groupIds,
  signal,
}: UpdateUserGroupsVariables & RequestConfig) =>
  http.put<void>(
    `/api/v1/user/${userId}/groups`,
    { groupIds },
    toAxiosConfig({ signal })
  );

const updateUserGroupsMutation = defineMutation<
  void,
  UpdateUserGroupsVariables
>({
  mutationFn: updateUserGroups,
  invalidateQueries: () => [["admin-users"]],
});

export const useUpdateUserGroups = updateUserGroupsMutation.useMutation;

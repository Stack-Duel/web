import { toAxiosConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { UserAvatar } from "../models/avatar";
import { http } from "@/shared/lib/http";

export const getAvatarHistory = ({ signal }: RequestConfig) =>
  http.get<UserAvatar[]>(
    "/api/v1/user/avatar-history",
    toAxiosConfig({ signal })
  );

const avatarHistoryQuery = defineQuery({
  queryKey: () => ["avatar-history"],
  queryFn: getAvatarHistory,
});

export const useAvatarHistory = avatarHistoryQuery.useQuery;

import { toAxiosConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { UserProfile } from "../models/user-profile";
import { http } from "@/shared/lib/http";

type GetUserProfileParams = { username: string };

export const getUserProfile = ({
  username,
  signal,
}: GetUserProfileParams & RequestConfig) =>
  http.get<UserProfile>(
    `/api/v1/user/profile/${encodeURIComponent(username)}`,
    toAxiosConfig({ signal })
  );

const userProfileQuery = defineQuery<UserProfile, GetUserProfileParams>({
  queryKey: ({ username }) => ["user-profile", username],
  queryFn: getUserProfile,
});

export const useUserProfile = userProfileQuery.useQuery;
export const useSuspenseUserProfile = userProfileQuery.useSuspenseQuery;

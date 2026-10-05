import { toAxiosConfig } from "@/shared/lib/request-config";
import { defineMutation } from "@/shared/api/define-mutation";
import type { RequestConfig } from "@/shared/lib/request-config";
import { http } from "@/shared/lib/http";

type UpsertUserVariables = {
  username: string;
  bio?: string;
  languageIds?: string[];
};

// The endpoint's response body is just an empty ack (MediatR Unit), not the updated
// User, so callers that need the fresh profile (e.g. to update the sidebar) should
// re-fetch the account query rather than trust this response.
export const updateUsername = ({
  signal,
  ...data
}: UpsertUserVariables & RequestConfig) =>
  http.put<void>("/api/v1/user", data, toAxiosConfig({ signal }));

const updateUsernameMutation = defineMutation<void, UpsertUserVariables>({
  mutationFn: updateUsername,
  invalidateQueries: (_data, variables) => [
    ["account"],
    ["user-profile", variables.username],
  ],
});

export const useUpdateUsername = updateUsernameMutation.useMutation;

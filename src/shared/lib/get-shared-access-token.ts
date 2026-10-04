import { getAccessToken } from "@auth0/nextjs-auth0";

let pendingRequest: Promise<string | undefined> | null = null;

export function getSharedAccessToken(): Promise<string | undefined> {
  pendingRequest ??= getAccessToken()
    .catch(() => undefined)
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

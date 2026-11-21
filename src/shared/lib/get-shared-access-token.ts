import { getAccessToken } from "@auth0/nextjs-auth0";

type AccessTokenResponse = {
  token: string;
  expires_at?: number;
  expires_in?: number;
};

const EXPIRY_GRACE_MS = 60_000;
const NO_SESSION_CACHE_MS = 5_000;

let cachedToken: { token: string; expiresAtMs: number } | null = null;
let noSessionUntilMs = 0;
let pendingRequest: Promise<string | undefined> | null = null;

export function clearSharedAccessToken() {
  cachedToken = null;
  noSessionUntilMs = 0;
  pendingRequest = null;
}

export function getSharedAccessToken(options?: {
  forceRefresh?: boolean;
}): Promise<string | undefined> {
  if (options?.forceRefresh) {
    clearSharedAccessToken();
    return fetchAccessToken();
  }

  const now = Date.now();

  if (cachedToken && cachedToken.expiresAtMs - EXPIRY_GRACE_MS > now) {
    return Promise.resolve(cachedToken.token);
  }

  if (now < noSessionUntilMs) {
    return Promise.resolve(undefined);
  }

  pendingRequest ??= fetchAccessToken().finally(() => {
    pendingRequest = null;
  });

  return pendingRequest;
}

async function fetchAccessToken(): Promise<string | undefined> {
  try {
    const response = await getAccessToken({ includeFullResponse: true });

    cachedToken = {
      token: response.token,
      expiresAtMs: resolveExpiryMs(response),
    };
    noSessionUntilMs = 0;

    return response.token;
  } catch {
    cachedToken = null;
    noSessionUntilMs = Date.now() + NO_SESSION_CACHE_MS;

    return undefined;
  }
}

function resolveExpiryMs(response: AccessTokenResponse): number {
  if (response.expires_at) {
    return response.expires_at * 1000;
  }

  if (response.expires_in) {
    return Date.now() + response.expires_in * 1000;
  }

  return Date.now();
}

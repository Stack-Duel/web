import { getAccessToken } from "@auth0/nextjs-auth0";
import { AccessTokenError } from "@auth0/nextjs-auth0/errors";

/**
 * Auth0 error codes that all mean the same thing for us: the session cannot
 * produce an access token any more, and no retry will change that. Anything else
 * (a network blip hitting /auth/access-token, an unexpected shape) is transient.
 */
const DEAD_SESSION_CODES = new Set<string>([
  "missing_session",
  "missing_refresh_token",
  "failed_to_refresh_token",
  "session_expired",
]);

/** How long a dead session is remembered before /auth/access-token is tried again. */
const DEAD_SESSION_TTL_MS = 30_000;

export type AccessTokenResult =
  /** A usable bearer token. */
  | { status: "token"; token: string }
  /** The session is dead — the caller should treat the user as signed out. */
  | { status: "session-expired" }
  /** No token this time, but the session may still be fine. */
  | { status: "unavailable" };

let pendingRequest: Promise<AccessTokenResult> | null = null;
let deadSessionUntil = 0;

async function requestAccessToken(): Promise<AccessTokenResult> {
  try {
    const token = await getAccessToken();
    return token ? { status: "token", token } : { status: "unavailable" };
  } catch (error) {
    if (
      error instanceof AccessTokenError &&
      DEAD_SESSION_CODES.has(error.code)
    ) {
      deadSessionUntil = Date.now() + DEAD_SESSION_TTL_MS;
      return { status: "session-expired" };
    }
    return { status: "unavailable" };
  }
}

/**
 * Fetches the access token, sharing one in-flight request across concurrent
 * callers. A dead session is cached for a short while so a page full of parallel
 * requests doesn't hammer /auth/access-token once refreshing has started failing.
 */
export function getSharedAccessToken(): Promise<AccessTokenResult> {
  if (Date.now() < deadSessionUntil) {
    return Promise.resolve({ status: "session-expired" });
  }

  pendingRequest ??= requestAccessToken().finally(() => {
    pendingRequest = null;
  });

  return pendingRequest;
}

/** Clears the in-flight request and the dead-session cache. */
export function resetSharedAccessToken(): void {
  pendingRequest = null;
  deadSessionUntil = 0;
}

/**
 * Bearer-string form for callers that can only hand over a token (SignalR's
 * accessTokenFactory, WebSocket query params) and have no way to react to an
 * expired session. An empty string means "connect unauthenticated and let the
 * server answer".
 */
export async function getSharedBearerToken(): Promise<string> {
  const result = await getSharedAccessToken();
  return result.status === "token" ? result.token : "";
}

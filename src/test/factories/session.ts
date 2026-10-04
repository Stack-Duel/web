import type { SessionData } from "@auth0/nextjs-auth0/types";
import { buildAuthUser } from "./auth-user";

export function buildSessionData(
  overrides: Partial<SessionData> = {}
): SessionData {
  return {
    user: buildAuthUser(),
    tokenSet: {
      accessToken: "test-access-token",
      scope: "openid profile email",
      expiresAt: Date.now() + 3600_000,
    },
    internal: {
      sid: "test-sid",
      createdAt: Date.now(),
    },
    ...overrides,
  };
}

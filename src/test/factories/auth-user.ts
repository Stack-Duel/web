import type { User as AuthUser } from "@auth0/nextjs-auth0/types";

export function buildAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    sub: "auth0|123456",
    name: "Test User",
    nickname: "testuser",
    email: "test-user@example.com",
    email_verified: true,
    picture: "https://example.com/avatar.png",
    ...overrides,
  };
}

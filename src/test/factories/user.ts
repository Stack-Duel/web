import type { User } from "@/domains/user/models/user";

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "user_1",
    username: "testuser",
    isPrivate: false,
    permissions: [],
    roles: [],
    languagePreferenceIds: [],
    ...overrides,
  };
}

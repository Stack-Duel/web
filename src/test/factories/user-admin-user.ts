import type { AdminUser } from "@/domains/user/models/admin-user";

export function buildAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: "admin_user_1",
    username: "adminuser",
    groups: [],
    ...overrides,
  };
}

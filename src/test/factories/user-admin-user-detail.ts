import type { AdminUserDetail } from "@/domains/user/models/admin-user-detail";

export function buildAdminUserDetail(
  overrides: Partial<AdminUserDetail> = {}
): AdminUserDetail {
  return {
    id: "admin_user_1",
    username: "adminuser",
    isPrivate: false,
    createdAt: new Date("2026-01-01T12:34:56.000Z"),
    groups: [],
    ...overrides,
  };
}

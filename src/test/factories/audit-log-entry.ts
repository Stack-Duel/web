import type { AuditLogEntry } from "@/domains/audit-log/models/audit-log-entry";

export function buildAuditLogEntry(
  overrides: Partial<AuditLogEntry> = {}
): AuditLogEntry {
  return {
    id: "audit_log_entry_1",
    actorUserId: "admin_user_1",
    actorUsername: "adminuser",
    action: "user.groups.updated",
    targetType: "user",
    targetId: "user_1",
    detailsJson: '{"groupIds":["group_1"]}',
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

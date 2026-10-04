export interface AuditLogEntry {
  id: string;
  actorUserId?: string;
  actorUsername: string;
  action: string;
  targetType?: string;
  targetId?: string;
  detailsJson?: string;
  createdAt: string;
}

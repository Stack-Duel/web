import {
  defaultTenantId,
  tenants,
  type TenantId,
} from "../config/tenant-config";

function normalizeHost(host: string): string {
  return host
    .split(":")[0]
    .toLowerCase()
    .replace(/^www\./, "");
}

export function resolveTenantFromHost(host: string | null): TenantId {
  if (!host) return defaultTenantId;

  const normalizedHost = normalizeHost(host);

  const match = Object.values(tenants).find(
    (tenant) => normalizeHost(tenant.domain) === normalizedHost
  );

  return match?.id ?? defaultTenantId;
}

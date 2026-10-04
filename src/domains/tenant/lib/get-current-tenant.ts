import { headers } from "next/headers";
import { env } from "@/env";
import { tenants, type TenantConfig } from "../config/tenant-config";
import { resolveTenantFromHost } from "./resolve-tenant";

export type ResolvedTenant = TenantConfig & { url: string };

export async function getCurrentTenant(): Promise<ResolvedTenant> {
  const headerList = await headers();
  const tenantId = resolveTenantFromHost(headerList.get("host"));
  return { ...tenants[tenantId], url: env.APP_BASE_URL };
}

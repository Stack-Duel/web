import { create } from "zustand";
import { defaultTenantId, tenants } from "../config/tenant-config";
import type { ResolvedTenant } from "../lib/get-current-tenant";

interface TenantState {
  tenant: ResolvedTenant;
  setTenant: (tenant: ResolvedTenant) => void;
}

const defaultTenant: ResolvedTenant = {
  ...tenants[defaultTenantId],
  url: `https://${tenants[defaultTenantId].domain}`,
};

export const useTenantStore = create<TenantState>((set) => ({
  tenant: defaultTenant,
  setTenant: (tenant) => set({ tenant }),
}));

export const useTenant = (): ResolvedTenant => useTenantStore((s) => s.tenant);

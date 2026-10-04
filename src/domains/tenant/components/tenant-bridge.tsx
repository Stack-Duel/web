"use client";

import { useEffect } from "react";
import { useTenantStore } from "../state/tenant-store";
import type { ResolvedTenant } from "../lib/get-current-tenant";

type TenantBridgeProps = {
  tenant: ResolvedTenant;
};

export function TenantBridge({ tenant }: Readonly<TenantBridgeProps>) {
  const setTenant = useTenantStore((s) => s.setTenant);

  useEffect(() => {
    setTenant(tenant);
    // Only sync when the resolved tenant identity actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant.id]);

  return null;
}

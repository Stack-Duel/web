import { tenants } from "@/domains/tenant/config/tenant-config";

export const testTenant = {
  ...tenants.algowars,
  domain: "algowars.test",
  url: "https://algowars.test",
};

export const getCurrentTenant = async () => testTenant;

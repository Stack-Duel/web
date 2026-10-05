import { describe, expect, it } from "vitest";
import { resolveTenantFromHost } from "./resolve-tenant";
import { defaultTenantId, tenants } from "../config/tenant-config";

describe("resolveTenantFromHost", () => {
  it("resolves the tenant whose domain matches the host", () => {
    expect(resolveTenantFromHost(tenants.algowars.domain)).toBe(
      tenants.algowars.id
    );
  });

  it("ignores the port when matching", () => {
    expect(resolveTenantFromHost(`${tenants.algowars.domain}:3000`)).toBe(
      tenants.algowars.id
    );
  });

  it("treats the apex domain and the www subdomain as the same tenant", () => {
    const apex = tenants.algowars.domain.replace(/^www\./, "");
    expect(resolveTenantFromHost(apex)).toBe(tenants.algowars.id);
  });

  it("falls back to the default tenant for an unrecognized host", () => {
    expect(resolveTenantFromHost("localhost:3000")).toBe(defaultTenantId);
    expect(resolveTenantFromHost("some-other-domain.com")).toBe(
      defaultTenantId
    );
  });

  it("falls back to the default tenant when there is no host header", () => {
    expect(resolveTenantFromHost(null)).toBe(defaultTenantId);
  });
});

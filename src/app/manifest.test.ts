import { describe, expect, it, vi } from "vitest";
import manifest from "./manifest";
import { testTenant } from "@/test/mocks/tenant";

vi.mock(
  "@/domains/tenant/lib/get-current-tenant",
  () => import("@/test/mocks/tenant")
);

describe("manifest", () => {
  it("describes the app using the current tenant's metadata", async () => {
    const result = await manifest();

    expect(result.name).toBe(testTenant.name);
    expect(result.short_name).toBe(testTenant.name);
    expect(result.description).toBe(testTenant.description);
  });

  it("configures a standalone start experience with the tenant's favicon", async () => {
    const result = await manifest();

    expect(result.start_url).toBe("/");
    expect(result.display).toBe("standalone");
    expect(result.icons).toEqual([
      {
        src: testTenant.favicon,
        sizes: "any",
        type: "image/svg+xml",
      },
    ]);
  });
});

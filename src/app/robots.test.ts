import { describe, expect, it, vi } from "vitest";
import robots from "./robots";
import { testTenant } from "@/test/mocks/tenant";

vi.mock(
  "@/domains/tenant/lib/get-current-tenant",
  () => import("@/test/mocks/tenant")
);

describe("robots", () => {
  it("allows crawling of public routes and disallows authenticated areas", async () => {
    const result = await robots();

    expect(result.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/dashboard",
        "/settings",
        "/user",
        "/auth",
        "/account",
      ],
    });
  });

  it("points to the sitemap at the tenant's site root", async () => {
    const result = await robots();

    expect(result.sitemap).toBe(`${testTenant.url}/sitemap.xml`);
  });
});

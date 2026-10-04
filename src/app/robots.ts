import type { MetadataRoute } from "next";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const tenant = await getCurrentTenant();

  return {
    rules: {
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
    },
    sitemap: `${tenant.url}/sitemap.xml`,
  };
}

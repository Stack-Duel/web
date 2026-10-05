import type { MetadataRoute } from "next";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const tenant = await getCurrentTenant();

  return {
    name: tenant.name,
    short_name: tenant.name,
    description: tenant.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#09090b",
    icons: [
      {
        src: tenant.favicon,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

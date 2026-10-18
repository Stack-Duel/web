import type { Metadata } from "next";
import AboutLayout from "@/views/about/about-layout";
import { routerConfig } from "@/shared/router-config";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();

  return {
    title: "About",
    description: `About ${tenant.name}: ${tenant.description}`,
    alternates: { canonical: routerConfig.about.path },
  };
}

export default function AboutPage() {
  return <AboutLayout />;
}

import type { Metadata } from "next";
import CommunityLayout from "@/views/community/community-layout";
import { routerConfig } from "@/shared/router-config";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();

  return {
    title: "Community",
    description: `Join the ${tenant.name} community on Discord, GitHub, and LinkedIn.`,
    alternates: { canonical: routerConfig.community.path },
  };
}

export default function CommunityPage() {
  return <CommunityLayout />;
}

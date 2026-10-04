import type { Metadata } from "next";
import CommunityLayout from "@/views/community/community-layout";
import { routerConfig } from "@/shared/router-config";
import { siteName } from "@/shared/lib/site";

export const metadata: Metadata = {
  title: "Community",
  description: `Join the ${siteName} community on Discord, GitHub, and LinkedIn.`,
  alternates: { canonical: routerConfig.community.path },
};

export default function CommunityPage() {
  return <CommunityLayout />;
}

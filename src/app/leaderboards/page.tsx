import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LeaderboardsLayout from "@/views/leaderboards/leaderboards-layout";
import { fetchFeatureFlags } from "@/domains/feature-flags/api/feature-flags-server-api";
import { FeatureFlags } from "@/domains/feature-flags/lib/well-known-features";
import type { FeatureFlags as FeatureFlagsMap } from "@/domains/feature-flags/models/feature-flags";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";
import { routerConfig } from "@/shared/router-config";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();

  return {
    title: "Leaderboards",
    description: `See who's on top of ${tenant.name}, an online competitive coding platform. Track top scores across code battles and coding challenges.`,
    alternates: { canonical: routerConfig.leaderboards.path },
  };
}

export default async function LeaderboardsPage() {
  const response = await fetchFeatureFlags();

  if (!response.ok) {
    notFound();
  }

  const flags: FeatureFlagsMap = await response.json();

  if (!flags[FeatureFlags.LEADERBOARDS]) {
    notFound();
  }

  return (
    <Suspense>
      <LeaderboardsLayout />
    </Suspense>
  );
}

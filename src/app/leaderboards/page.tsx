import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LeaderboardsLayout from "@/views/leaderboards/leaderboards-layout";
import { fetchFeatureFlags } from "@/domains/feature-flags/api/feature-flags-server-api";
import { FeatureFlags } from "@/domains/feature-flags/lib/well-known-features";
import type { FeatureFlags as FeatureFlagsMap } from "@/domains/feature-flags/models/feature-flags";
import { siteName } from "@/shared/lib/site";
import { routerConfig } from "@/shared/router-config";

export const metadata: Metadata = {
  title: "Leaderboards",
  description: `See who's on top of ${siteName}, an online competitive coding platform. Track top scores across code battles and coding challenges.`,
  alternates: { canonical: routerConfig.leaderboards.path },
};

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

"use client";

import PlayDuelCard from "@/domains/game/components/play-duel-card";
import PlayFFACard from "@/domains/game/components/play-ffa-card";
import DashboardStatsCard from "@/domains/dashboard/components/dashboard-stats-card";
import DailyChallengeCard from "@/domains/daily-challenge/components/daily-challenge-card";
import dynamic from "next/dynamic";

const PlaySoloRushCard = dynamic(
  () => import("@/domains/game/components/play-solo-rush-card"),
  { ssr: false }
);
import ProblemTable from "@/domains/problem/tables/problem-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import SocialLinkButton from "@/shared/components/social-link-button";
import { discordLink } from "@/shared/lib/social-links";
import { ModeToggle } from "@/shared/theme/mode-toggle";
import {
  dashboardSoloRushMode,
  dashboardDuelMode,
  dashboardFfaMode,
} from "./dashboard-game-modes";

export default function DashboardLayout() {
  return (
    <SidebarLayout
      breadcrumbs={[]}
      headerItems={
        <div className="ml-auto mr-3 flex items-center gap-2">
          <SocialLinkButton
            href={discordLink.href}
            icon={discordLink.icon}
            label="Join our Discord"
          >
            Join the Discord
          </SocialLinkButton>
          <ModeToggle />
        </div>
      }
    >
      <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
        <DashboardStatsCard className="col-span-12 @2xl:col-span-6" />
        <DailyChallengeCard className="col-span-12 @2xl:col-span-6" />
        <PlaySoloRushCard
          gameMode={dashboardSoloRushMode}
          className="col-span-12 @3xl:col-span-4"
        />
        <PlayDuelCard
          gameMode={dashboardDuelMode}
          className="col-span-12 @2xl:col-span-6 @3xl:col-span-4"
        />
        <PlayFFACard
          gameMode={dashboardFfaMode}
          className="col-span-12 @2xl:col-span-6 @3xl:col-span-4"
        />
        <Card className="col-span-12">
          <CardHeader>
            <CardTitle>Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <ProblemTable />
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}

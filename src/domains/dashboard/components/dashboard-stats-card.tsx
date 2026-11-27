"use client";

import { Flame, Sparkles, Trophy } from "lucide-react";
import { useMyDashboardStats } from "../api/get-my-dashboard-stats";
import { StatTile } from "./stat-tile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type DashboardStatsCardProps = {
  className?: string;
};

export default function DashboardStatsCard({
  className,
}: Readonly<DashboardStatsCardProps>) {
  const { data: stats } = useMyDashboardStats();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Your stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-3">
          <StatTile label="Wins" value={stats?.wins} icon={Trophy} />
          <StatTile
            label="Current streak"
            value={stats?.currentStreak}
            icon={Flame}
          />
          <StatTile
            label="Longest streak"
            value={stats?.longestStreak}
            icon={Sparkles}
          />
        </div>
      </CardContent>
    </Card>
  );
}

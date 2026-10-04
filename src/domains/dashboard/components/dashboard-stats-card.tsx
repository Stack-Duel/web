"use client";

import { Flame, Sparkles, Trophy } from "lucide-react";
import { useUserGameStats } from "@/domains/user/api/get-user-game-stats";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import { useTodaysDailyChallenge } from "@/domains/daily-challenge/api/get-todays-daily-challenge";
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
  const user = useUserStore(selectUser);
  const username = user?.username;

  const { data: stats } = useUserGameStats({
    username: username ?? "",
    queryConfig: { enabled: !!username },
  });
  const { data: dailyChallenge, isLoading: isDailyChallengeLoading } =
    useTodaysDailyChallenge();

  const gameModeStats = stats?.gameModeStats ?? null;
  const wins = (gameModeStats ?? []).reduce(
    (total, stat) => total + stat.wins,
    0
  );
  const currentStreak = isDailyChallengeLoading
    ? undefined
    : (dailyChallenge?.currentStreak ?? 0);
  const longestStreak = isDailyChallengeLoading
    ? undefined
    : (dailyChallenge?.longestStreak ?? 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Your stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-3">
          <StatTile
            label="Wins"
            value={gameModeStats ? wins : undefined}
            icon={Trophy}
          />
          <StatTile label="Current streak" value={currentStreak} icon={Flame} />
          <StatTile
            label="Longest streak"
            value={longestStreak}
            icon={Sparkles}
          />
        </div>
      </CardContent>
    </Card>
  );
}

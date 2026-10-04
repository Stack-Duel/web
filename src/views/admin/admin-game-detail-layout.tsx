"use client";

import { Crown } from "lucide-react";
import { useAdminGameDetail } from "@/domains/game/api/get-admin-game-detail";
import { useGameModes } from "@/domains/game/api/use-game-modes";
import AdminGamePlayerHistoryTabs from "@/domains/game/components/admin-game-player-history-tabs";
import type { GameParticipant } from "@/domains/game/models/game";
import { AuthGuard } from "@/shared/guards/auth-guard";
import { Permissions } from "@/shared/lib/permissions";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";

type AdminGameDetailLayoutProps = {
  id: string;
};

export default function AdminGameDetailLayout({
  id,
}: Readonly<AdminGameDetailLayoutProps>) {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_GAMES_READ}
      fallback={
        <NotFoundCard
          title="Page not found"
          description="We could not find the page you are looking for. It may have been removed, renamed, or the link is incorrect."
        />
      }
    >
      <SidebarLayout
        breadcrumbs={[
          { name: "Admin", url: "/admin" },
          { name: "Games", url: "/admin/games" },
          { name: id },
        ]}
      >
        <AdminGameDetailContent id={id} />
      </SidebarLayout>
    </AuthGuard>
  );
}

function AdminGameDetailContent({ id }: Readonly<{ id: string }>) {
  const { data, isLoading, error } = useAdminGameDetail({ gameId: id });
  const { data: gameModes } = useGameModes();

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  if (error || !data) {
    return <div className="p-4 text-sm text-destructive">Game not found.</div>;
  }

  const gameModeName =
    gameModes?.find((mode) => mode.key === data.gameModeKey)?.name ??
    data.gameModeKey;

  const sorted = [...data.participants].sort((a, b) => b.score - a.score);
  const topScore = sorted[0]?.score ?? 0;

  return (
    <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {gameModeName}
            <Badge variant="secondary">{data.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm text-muted-foreground @md:grid-cols-4">
          <div>
            <div className="font-medium text-foreground">Time limit</div>
            <div>{Math.round(data.timeLimitInSeconds / 60)} min</div>
          </div>
          <div>
            <div className="font-medium text-foreground">Created</div>
            <div>{new Date(data.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="font-medium text-foreground">Started</div>
            <div>
              {data.startedAt ? new Date(data.startedAt).toLocaleString() : "-"}
            </div>
          </div>
          <div>
            <div className="font-medium text-foreground">Ended</div>
            <div>
              {data.endedAt ? new Date(data.endedAt).toLocaleString() : "-"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1.5">
            {sorted.map((participant) => (
              <ParticipantRow
                key={participant.userId}
                participant={participant}
                topScore={topScore}
              />
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Player history</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminGamePlayerHistoryTabs gameId={id} participants={sorted} />
        </CardContent>
      </Card>
    </div>
  );
}

function ParticipantRow({
  participant,
  topScore,
}: Readonly<{ participant: GameParticipant; topScore: number }>) {
  return (
    <li className="flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5">
      <Avatar size="sm">
        <AvatarImage src={participant.imageUrl} alt={participant.username} />
        <AvatarFallback>
          {participant.username?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <span className="flex-1 truncate text-sm font-medium">
        {participant.username}
      </span>
      {participant.hasForfeited ? (
        <Badge variant="destructive">Forfeited</Badge>
      ) : null}
      {participant.hasFinishedProblems ? (
        <Badge variant="secondary">Finished</Badge>
      ) : null}
      {topScore > 0 && participant.score === topScore ? (
        <Crown size={14} className="text-amber-600 dark:text-amber-400" />
      ) : null}
      <span className="text-sm tabular-nums text-muted-foreground">
        {participant.score}
      </span>
    </li>
  );
}

"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/ui/data-table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { routerConfig } from "@/shared/router-config";
import {
  useUserStore,
  selectIsAuthenticated,
} from "@/domains/user/state/user-store";
import { useMyActiveGames } from "../api/get-my-active-games";
import { useLobbyListRealtimeSync } from "../hooks/use-lobby-list-realtime-sync";
import { GameStatus } from "../models/game";
import type { MyActiveGame } from "../models/my-active-game";
import LeaveLobbyButton from "../components/leave-lobby-button";

function formatDuration(durationSeconds: number) {
  return `${durationSeconds / 60} min`;
}

function ActionCell({ game }: Readonly<{ game: MyActiveGame }>) {
  const router = useRouter();
  const isPending = game.status === GameStatus.Pending;

  return (
    <div className="flex items-center justify-end gap-2">
      {isPending ? <LeaveLobbyButton gameId={game.gameId} /> : null}
      <Button
        size="sm"
        onClick={() =>
          router.push(routerConfig.gamePlay.execute({ gameId: game.gameId }))
        }
      >
        {isPending ? "Open lobby" : "Rejoin"}
      </Button>
    </div>
  );
}

const columns: ColumnDef<MyActiveGame>[] = [
  {
    accessorKey: "gameModeName",
    header: "Mode",
  },
  {
    accessorKey: "hostUsername",
    header: "Host",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === GameStatus.Running ? "default" : "secondary"
        }
      >
        {row.original.status === GameStatus.Running
          ? "In progress"
          : "Waiting for players"}
      </Badge>
    ),
  },
  {
    id: "players",
    header: "Players",
    cell: ({ row }) =>
      `${row.original.participantCount}/${row.original.maxPlayers}`,
  },
  {
    id: "techStacks",
    header: "Tech stacks",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.techStacks.map((techStack) => (
          <Badge key={techStack} variant="outline">
            {techStack}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "timeLimitInSeconds",
    header: "Time limit",
    cell: ({ row }) => formatDuration(row.original.timeLimitInSeconds),
  },
  {
    id: "action",
    header: "",
    cell: ({ row }) => <ActionCell game={row.original} />,
  },
];

export default function MyActiveGamesTable() {
  const isAuthenticated = useUserStore(selectIsAuthenticated);
  const { data: games, isLoading } = useMyActiveGames(isAuthenticated);
  useLobbyListRealtimeSync(
    (games ?? [])
      .filter((game) => game.status === GameStatus.Pending)
      .map((game) => game.gameId)
  );

  if (!isAuthenticated || (!isLoading && (!games || games.length === 0))) {
    return null;
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-muted-foreground">
          My active games
        </h4>
        <DataTable
          isLoading={isLoading}
          skeletonRows={2}
          data={games ?? []}
          columns={columns}
        />
      </CardContent>
    </Card>
  );
}

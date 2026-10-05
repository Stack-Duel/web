"use client";

import { useState } from "react";
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
} from "@tanstack/react-table";
import { DataTable } from "@/shared/components/ui/data-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { useLeaderboard } from "../api/get-leaderboard";
import type { LeaderboardEntry } from "../models/leaderboard-entry";
import type { GameModeKey } from "@/domains/game/models/game-mode";

const columns: ColumnDef<LeaderboardEntry>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => `#${row.original.rank}`,
  },
  {
    id: "player",
    header: "Player",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarImage src={row.original.imageUrl ?? undefined} alt="" />
          <AvatarFallback>
            {row.original.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>{row.original.username}</span>
        {row.original.isCurrentUser ? (
          <Badge variant="secondary">You</Badge>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "highScore",
    header: "High score",
  },
];

const PAGE_SIZE = 25;

type LeaderboardTableProps = {
  gameModeKey: GameModeKey;
  timeLimitInSeconds: number;
};

export default function LeaderboardTable({
  gameModeKey,
  timeLimitInSeconds,
}: Readonly<LeaderboardTableProps>) {
  const [pageIndex, setPageIndex] = useState(0);

  const { data, isLoading } = useLeaderboard({
    gameModeKey,
    timeLimitInSeconds,
    page: pageIndex + 1,
    size: PAGE_SIZE,
  });

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next =
      typeof updater === "function"
        ? updater({ pageIndex, pageSize: PAGE_SIZE })
        : updater;
    setPageIndex(next.pageIndex);
  };

  const pageCount = data
    ? (data.totalPages ?? Math.max(1, Math.ceil(data.total / PAGE_SIZE)))
    : -1;

  return (
    <DataTable
      isLoading={isLoading}
      skeletonRows={5}
      data={data?.results ?? []}
      columns={columns}
      paginationProps={{}}
      manualPagination={{
        pagination: { pageIndex, pageSize: PAGE_SIZE },
        onPaginationChange: handlePaginationChange,
        pageCount,
      }}
    />
  );
}

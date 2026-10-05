"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";

import { DataTable } from "@/shared/components/ui/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { routerConfig } from "@/shared/router-config";
import { useAdminGameListStore } from "../state/admin-game-list-store";
import { useAdminGames } from "../api/get-admin-games";
import { GameStatus } from "../models/game";
import type { AdminGameListItem } from "../models/admin-game";

function getStatusVariant(status: AdminGameListItem["status"]) {
  if (status === GameStatus.Cancelled) return "destructive" as const;
  if (status === GameStatus.Pending) return "outline" as const;
  return "secondary" as const;
}

function getStatusClassName(status: AdminGameListItem["status"]) {
  return status === GameStatus.Completed
    ? "bg-green-600 text-white hover:bg-green-600/90"
    : undefined;
}

const columns: ColumnDef<AdminGameListItem>[] = [
  {
    accessorKey: "gameModeName",
    header: "Mode",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={getStatusVariant(row.original.status)}
        className={getStatusClassName(row.original.status)}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "participants",
    header: "Participants",
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-xs">
        {row.original.participants.map((p) => p.username).join(", ")}
      </span>
    ),
  },
  {
    id: "timeLimit",
    header: "Time limit",
    cell: ({ row }) =>
      `${Math.round(row.original.timeLimitInSeconds / 60)} min`,
  },
  {
    id: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "endedAt",
    header: "Ended",
    cell: ({ row }) =>
      row.original.endedAt
        ? new Date(row.original.endedAt).toLocaleString()
        : "-",
  },
];

export default function AdminGamesTable() {
  const router = useRouter();
  const pageIndex = useAdminGameListStore((s) => s.pageIndex);
  const pageSize = useAdminGameListStore((s) => s.pageSize);
  const timestamp = useAdminGameListStore((s) => s.timestamp);
  const statusFilter = useAdminGameListStore((s) => s.statusFilter);
  const setPagination = useAdminGameListStore((s) => s.setPagination);
  const resetSession = useAdminGameListStore((s) => s.resetSession);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const { data, isLoading } = useAdminGames({
    page: pageIndex + 1,
    size: pageSize,
    timestamp,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next =
      typeof updater === "function"
        ? updater({ pageIndex, pageSize })
        : updater;
    setPagination(next.pageIndex, next.pageSize);
  };

  const pageCount = data
    ? (data.totalPages ?? Math.max(1, Math.ceil(data.total / pageSize)))
    : -1;

  return (
    <DataTable
      isLoading={isLoading}
      skeletonRows={5}
      data={data?.results ?? []}
      columns={columns}
      onRowClick={(row) =>
        router.push(routerConfig.adminGameDetail.execute({ id: row.gameId }))
      }
      paginationProps={{}}
      manualPagination={{
        pagination: { pageIndex, pageSize },
        onPaginationChange: handlePaginationChange,
        pageCount,
      }}
    />
  );
}

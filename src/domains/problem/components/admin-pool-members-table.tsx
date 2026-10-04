"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/ui/data-table";
import DifficultyBadge from "./difficulty-badge";
import AdminProblemStatusBadge from "./admin-problem-status-badge";
import { useProblemPoolMembers } from "../api/get-problem-pool-members";
import { useRemoveProblemFromPool } from "../api/remove-problem-from-pool";
import type { AdminProblemListItem } from "../models/admin-problem";

const PAGE_SIZE = 20;

type AdminPoolMembersTableProps = {
  poolKey: string;
};

export default function AdminPoolMembersTable({
  poolKey,
}: Readonly<AdminPoolMembersTableProps>) {
  const [pageIndex, setPageIndex] = useState(0);
  const [timestamp] = useState(() => new Date().toISOString());

  const { data, isLoading } = useProblemPoolMembers({
    poolKey,
    page: pageIndex + 1,
    size: PAGE_SIZE,
    timestamp,
  });

  const { mutate: removeFromPool, isPending: isRemoving } =
    useRemoveProblemFromPool();

  const handleRemove = (problemId: string) => {
    removeFromPool(
      { poolKey, problemId },
      {
        onError: (error) =>
          toast.error(error.message || "Failed to remove problem from pool"),
      }
    );
  };

  const columns: ColumnDef<AdminProblemListItem>[] = [
    { accessorKey: "title", header: "Title" },
    {
      accessorKey: "difficultyTier",
      header: "Difficulty",
      cell: ({ row }) => (
        <DifficultyBadge difficulty={row.original.difficultyTier} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <AdminProblemStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "languages",
      header: "Languages",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.languages.join(", ")}
        </span>
      ),
    },
    {
      id: "remove",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          disabled={isRemoving}
          onClick={() => handleRemove(row.original.id)}
        >
          <X size={14} /> Remove
        </Button>
      ),
    },
  ];

  const total = data?.total ?? 0;

  return (
    <DataTable
      isLoading={isLoading}
      skeletonRows={5}
      data={data?.results ?? []}
      columns={columns}
      getRowId={(row) => row.id}
      manualPagination={{
        pagination: { pageIndex, pageSize: PAGE_SIZE },
        onPaginationChange: (updater) => {
          const next =
            typeof updater === "function"
              ? updater({ pageIndex, pageSize: PAGE_SIZE })
              : updater;
          setPageIndex(next.pageIndex);
        },
        pageCount: data ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : -1,
      }}
    />
  );
}

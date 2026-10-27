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
import DifficultyBadge from "../components/difficulty-badge";
import AdminProblemStatusBadge from "../components/admin-problem-status-badge";
import { useMyProblemListStore } from "../state/my-problem-list-store";
import { useMyProblems } from "../api/get-my-problems";
import type { MyProblemListItem } from "../models/my-problem";

const columns: ColumnDef<MyProblemListItem>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.slug}</span>
    ),
  },
  {
    id: "difficulty",
    header: "Difficulty",
    cell: ({ row }) => (
      <DifficultyBadge difficulty={row.original.difficultyTier} />
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <AdminProblemStatusBadge status={row.original.status} />,
  },
  {
    id: "languages",
    header: "Languages",
    cell: ({ row }) => {
      const { languages } = row.original;

      if (languages.length === 0) {
        return <span className="text-muted-foreground">No setups</span>;
      }

      return (
        <>
          <span className="text-muted-foreground @md:hidden">
            {languages.length} language{languages.length === 1 ? "" : "s"}
          </span>
          <div className="hidden flex-wrap gap-1 @md:flex">
            {languages.map((language) => (
              <Badge key={language} variant="secondary">
                {language}
              </Badge>
            ))}
          </div>
        </>
      );
    },
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) =>
      row.original.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">No tags</span>
      ),
  },
  {
    id: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
];

export default function MyProblemsTable() {
  const router = useRouter();
  const pageIndex = useMyProblemListStore((s) => s.pageIndex);
  const pageSize = useMyProblemListStore((s) => s.pageSize);
  const timestamp = useMyProblemListStore((s) => s.timestamp);
  const search = useMyProblemListStore((s) => s.search);
  const statusFilter = useMyProblemListStore((s) => s.statusFilter);
  const setPagination = useMyProblemListStore((s) => s.setPagination);
  const resetSession = useMyProblemListStore((s) => s.resetSession);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const trimmedSearch = search.trim();

  const { data, isLoading } = useMyProblems({
    page: pageIndex + 1,
    size: pageSize,
    timestamp,
    search: trimmedSearch || undefined,
    statuses: statusFilter.length === 0 ? undefined : statusFilter,
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
        router.push(routerConfig.studioProblemDetail.execute({ id: row.id }))
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

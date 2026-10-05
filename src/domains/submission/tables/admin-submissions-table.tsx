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
import { useAdminSubmissionListStore } from "../state/admin-submission-list-store";
import { useAdminSubmissions } from "../api/get-admin-submissions";
import { isValidGuid } from "../components/admin-submission-search-input";
import type { AdminSubmissionListItem } from "../models/admin-submission";

function getStatusVariant(status: AdminSubmissionListItem["status"]) {
  return status === "WrongAnswer"
    ? ("destructive" as const)
    : ("secondary" as const);
}

function getStatusClassName(status: AdminSubmissionListItem["status"]) {
  return status === "Accepted"
    ? "bg-green-600 text-white hover:bg-green-600/90"
    : undefined;
}

const columns: ColumnDef<AdminSubmissionListItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id}</span>
    ),
  },
  {
    accessorKey: "problemTitle",
    header: "Problem",
  },
  {
    accessorKey: "type",
    header: "Type",
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
    id: "language",
    header: "Language",
    cell: ({ row }) =>
      `${row.original.language.name} ${row.original.language.version}`,
  },
  {
    id: "user",
    header: "User",
    cell: ({ row }) => row.original.user.username,
  },
  {
    id: "createdAt",
    header: "Submitted",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
];

export default function AdminSubmissionsTable() {
  const router = useRouter();
  const pageIndex = useAdminSubmissionListStore((s) => s.pageIndex);
  const pageSize = useAdminSubmissionListStore((s) => s.pageSize);
  const timestamp = useAdminSubmissionListStore((s) => s.timestamp);
  const searchId = useAdminSubmissionListStore((s) => s.searchId);
  const setPagination = useAdminSubmissionListStore((s) => s.setPagination);
  const resetSession = useAdminSubmissionListStore((s) => s.resetSession);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const trimmedSearch = searchId.trim();
  const validSearchId =
    trimmedSearch && isValidGuid(trimmedSearch) ? trimmedSearch : undefined;

  const { data, isLoading } = useAdminSubmissions({
    page: pageIndex + 1,
    size: pageSize,
    timestamp,
    id: validSearchId,
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
        router.push(routerConfig.adminSubmissionDetail.execute({ id: row.id }))
      }
      paginationProps={{}}
      manualPagination={{
        pagination: { pageIndex, pageSize },
        onPaginationChange: handlePaginationChange,
        pageCount: validSearchId ? 1 : pageCount,
      }}
    />
  );
}

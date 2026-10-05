"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/shared/components/ui/data-table";
import { useAdminListPagination } from "@/shared/hooks/use-admin-list-pagination";
import { useAdminAuditLogStore } from "../state/admin-audit-log-store";
import { useAdminAuditLog } from "../api/get-admin-audit-log";
import type { AuditLogEntry } from "../models/audit-log-entry";

const columns: ColumnDef<AuditLogEntry>[] = [
  {
    id: "createdAt",
    header: "Time",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: "actorUsername",
    header: "Actor",
  },
  {
    accessorKey: "action",
    header: "Action",
  },
  {
    id: "target",
    header: "Target",
    cell: ({ row }) =>
      row.original.targetType ? (
        <span>
          {row.original.targetType}
          {row.original.targetId ? `:${row.original.targetId}` : ""}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    id: "details",
    header: "Details",
    cell: ({ row }) =>
      row.original.detailsJson ? (
        <code className="text-xs break-all">{row.original.detailsJson}</code>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
];

export default function AdminAuditLogTable() {
  const {
    pageIndex,
    pageSize,
    timestamp,
    handlePaginationChange,
    getPageCount,
  } = useAdminListPagination(useAdminAuditLogStore);

  const { data, isLoading } = useAdminAuditLog({
    page: pageIndex + 1,
    size: pageSize,
    timestamp,
  });

  return (
    <DataTable
      isLoading={isLoading}
      skeletonRows={5}
      data={data?.results ?? []}
      columns={columns}
      paginationProps={{}}
      manualPagination={{
        pagination: { pageIndex, pageSize },
        onPaginationChange: handlePaginationChange,
        pageCount: getPageCount(data),
      }}
    />
  );
}

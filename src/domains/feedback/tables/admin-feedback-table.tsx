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
import { useAdminFeedbackListStore } from "../state/admin-feedback-list-store";
import { useAdminFeedback } from "../api/get-admin-feedback";
import type { AdminFeedbackListItem } from "../models/feedback";

function getStatusVariant(status: AdminFeedbackListItem["status"]) {
  return status === "Resolved" ? ("secondary" as const) : ("outline" as const);
}

function getStatusClassName(status: AdminFeedbackListItem["status"]) {
  return status === "Resolved"
    ? "bg-green-600 text-white hover:bg-green-600/90"
    : undefined;
}

const columns: ColumnDef<AdminFeedbackListItem>[] = [
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
    id: "message",
    header: "Message",
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-md">{row.original.message}</span>
    ),
  },
  {
    id: "rating",
    header: "Rating",
    cell: ({ row }) => row.original.rating ?? "-",
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

export default function AdminFeedbackTable() {
  const router = useRouter();
  const pageIndex = useAdminFeedbackListStore((s) => s.pageIndex);
  const pageSize = useAdminFeedbackListStore((s) => s.pageSize);
  const timestamp = useAdminFeedbackListStore((s) => s.timestamp);
  const typeFilter = useAdminFeedbackListStore((s) => s.typeFilter);
  const statusFilter = useAdminFeedbackListStore((s) => s.statusFilter);
  const setPagination = useAdminFeedbackListStore((s) => s.setPagination);
  const resetSession = useAdminFeedbackListStore((s) => s.resetSession);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const { data, isLoading } = useAdminFeedback({
    page: pageIndex + 1,
    size: pageSize,
    timestamp,
    type: typeFilter === "all" ? undefined : typeFilter,
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
        router.push(routerConfig.adminFeedbackDetail.execute({ id: row.id }))
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

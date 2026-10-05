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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { routerConfig } from "@/shared/router-config";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import EditUserGroupsDialog from "../components/edit-user-groups-dialog";
import { useAdminUserListStore } from "../state/admin-user-list-store";
import { useAdminUsers } from "../api/get-admin-users";
import type { AdminUser } from "../models/admin-user";

const SEARCH_DEBOUNCE_MS = 300;

const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarImage
            src={row.original.imageUrl}
            alt={row.original.username}
          />
          <AvatarFallback>
            {row.original.username[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <span>{row.original.username}</span>
      </div>
    ),
  },
  {
    id: "groups",
    header: "Groups",
    cell: ({ row }) =>
      row.original.groups.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {row.original.groups.map((group) => (
            <Badge key={group.id} variant="secondary">
              {group.name}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">No groups</span>
      ),
  },
  {
    id: "action",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <EditUserGroupsDialog user={row.original} />
      </div>
    ),
  },
];

export default function AdminUsersTable() {
  const router = useRouter();
  const pageIndex = useAdminUserListStore((s) => s.pageIndex);
  const pageSize = useAdminUserListStore((s) => s.pageSize);
  const timestamp = useAdminUserListStore((s) => s.timestamp);
  const search = useAdminUserListStore((s) => s.search);
  const setPagination = useAdminUserListStore((s) => s.setPagination);
  const resetSession = useAdminUserListStore((s) => s.resetSession);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const trimmedSearch = debouncedSearch.trim();

  const { data, isLoading } = useAdminUsers({
    page: pageIndex + 1,
    size: pageSize,
    timestamp,
    search: trimmedSearch || undefined,
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
        router.push(routerConfig.adminUserDetail.execute({ id: row.id }))
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

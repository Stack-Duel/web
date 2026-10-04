import { useEffect } from "react";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import type { StoreApi, UseBoundStore } from "zustand";
import type { PageResult } from "@/shared/pagination/page-result";

interface AdminListStoreState {
  pageIndex: number;
  pageSize: number;
  timestamp: string;
  setPagination: (pageIndex: number, pageSize: number) => void;
  resetSession: () => void;
}

export function useAdminListPagination<TState extends AdminListStoreState>(
  useStore: UseBoundStore<StoreApi<TState>>
) {
  const pageIndex = useStore((s) => s.pageIndex);
  const pageSize = useStore((s) => s.pageSize);
  const timestamp = useStore((s) => s.timestamp);
  const setPagination = useStore((s) => s.setPagination);
  const resetSession = useStore((s) => s.resetSession);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next =
      typeof updater === "function"
        ? updater({ pageIndex, pageSize })
        : updater;
    setPagination(next.pageIndex, next.pageSize);
  };

  const getPageCount = (data: PageResult<unknown> | undefined) =>
    data
      ? (data.totalPages ?? Math.max(1, Math.ceil(data.total / pageSize)))
      : -1;

  return {
    pageIndex,
    pageSize,
    timestamp,
    handlePaginationChange,
    getPageCount,
  };
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { DataTable } from "@/shared/components/ui/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import DifficultyBadge from "./difficulty-badge";
import AdminProblemStatusBadge from "./admin-problem-status-badge";
import { useAdminProblems } from "../api/get-admin-problems";
import { useAddProblemsToPool } from "../api/add-problems-to-pool";
import { usePoolAddSelection } from "../hooks/use-pool-add-selection";
import type { AdminProblemListItem } from "../models/admin-problem";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;

type AdminPoolAddTableProps = {
  poolKey: string;
  memberIds: Set<string>;
  onAdded?: () => void;
};

export default function AdminPoolAddTable({
  poolKey,
  memberIds,
  onAdded,
}: Readonly<AdminPoolAddTableProps>) {
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [timestamp] = useState(() => new Date().toISOString());
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS).trim();

  const {
    selection,
    rowSelection,
    onRowSelectionChange,
    selectAllMatching,
    clear,
    isAllOnPageSelected,
    selectedCount,
  } = usePoolAddSelection();

  const { data, isLoading } = useAdminProblems({
    page: pageIndex + 1,
    size: PAGE_SIZE,
    timestamp,
    search: debouncedSearch || undefined,
  });

  const { mutateAsync: addProblems, isPending: isSaving } =
    useAddProblemsToPool();

  const addableResults = (data?.results ?? []).filter(
    (result) => !memberIds.has(result.id)
  );
  const pageIds = addableResults.map((r) => r.id);
  const total = data?.total ?? 0;
  const hasMoreThanPage = total > addableResults.length;

  const columns: ColumnDef<AdminProblemListItem>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={isAllOnPageSelected(pageIds)}
          onCheckedChange={(checked) => {
            if (!checked) {
              clear();
            } else if (hasMoreThanPage) {
              selectAllMatching();
            } else {
              onRowSelectionChange(
                pageIds,
                Object.fromEntries(pageIds.map((id) => [id, true]))
              );
            }
          }}
          aria-label="Select all matching problems"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={!!rowSelection(pageIds)[row.original.id]}
          onCheckedChange={(checked) =>
            onRowSelectionChange(pageIds, {
              ...rowSelection(pageIds),
              [row.original.id]: !!checked,
            })
          }
          aria-label={`Select ${row.original.title}`}
        />
      ),
    },
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
  ];

  const handleSave = async () => {
    try {
      const addedCount = await addProblems(
        selection.mode === "all-matching"
          ? {
              poolKey,
              problemIds: [],
              selectAllMatching: true,
              search: debouncedSearch || undefined,
              excludedProblemIds: [...selection.excludedIds],
            }
          : {
              poolKey,
              problemIds: Object.entries(selection.rowSelection)
                .filter(([, selected]) => selected)
                .map(([id]) => id),
              selectAllMatching: false,
              excludedProblemIds: [],
            }
      );
      toast.success(`Added ${addedCount} problem(s) to the pool`);
      clear();
      if (addedCount > 0) {
        onAdded?.();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add problems"
      );
    }
  };

  return (
    <div className="space-y-3">
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPageIndex(0);
        }}
        placeholder="Search by title or slug..."
      />

      <DataTable
        isLoading={isLoading}
        skeletonRows={5}
        data={addableResults}
        columns={columns}
        getRowId={(row) => row.id}
        enableRowSelection
        rowSelection={rowSelection(pageIds)}
        onRowSelectionChange={(updater) =>
          onRowSelectionChange(pageIds, updater)
        }
        paginationProps={{ showSelectionSummary: false }}
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

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedCount(total)} selected
        </span>
        <Button
          onClick={handleSave}
          disabled={isSaving || selectedCount(total) === 0}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

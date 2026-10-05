"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import DifficultyBadge from "../components/difficulty-badge";
import { useProblemListStore } from "../state/problem-list-store";

import { DataTable } from "@/shared/components/ui/data-table";
import { routerConfig } from "@/shared/router-config";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { ProblemSummary } from "../models/problem-summary";
import { useProblems } from "../api/use-problems";
import type { PageResult } from "@/shared/pagination/page-result";

const SEARCH_DEBOUNCE_MS = 300;
const VISIBLE_LANGUAGE_COUNT = 2;

const columns: ColumnDef<ProblemSummary>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={routerConfig.problem.execute({ slug: row.original.slug })}
        onClick={(event) => event.stopPropagation()}
        className="hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "difficultyTier",
    header: "Difficulty",
    cell: ({ row }) => (
      <DifficultyBadge difficulty={row.original.difficultyTier} />
    ),
  },
  {
    id: "languages",
    header: "Languages",
    cell: ({ row }) => {
      const languages = row.original.languages;
      if (languages.length === 0) return null;

      const visible = languages.slice(0, VISIBLE_LANGUAGE_COUNT);
      const remaining = languages.length - visible.length;

      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {visible.map((language, index) => (
            <span key={language.id}>
              {language.name}
              {index < visible.length - 1 ? "," : ""}
            </span>
          ))}
          {remaining > 0 ? <span>+{remaining} more</span> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.tags.join(", ")}
      </span>
    ),
  },
];

interface ProblemTableProps {
  initialProblems?: PageResult<ProblemSummary>;
}

export default function ProblemTable({
  initialProblems,
}: Readonly<ProblemTableProps>) {
  const router = useRouter();

  const pageIndex = useProblemListStore((s) => s.pageIndex);
  const pageSize = useProblemListStore((s) => s.pageSize);
  const timestamp = useProblemListStore((s) => s.timestamp);
  const search = useProblemListStore((s) => s.search);
  const setPagination = useProblemListStore((s) => s.setPagination);
  const resetSession = useProblemListStore((s) => s.resetSession);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const trimmedSearch = debouncedSearch.trim();
  const isDefaultView = pageIndex === 0 && !trimmedSearch;

  const { data, isLoading } = useProblems({
    page: pageIndex + 1,
    size: pageSize,
    timestamp,
    search: trimmedSearch || undefined,
    queryConfig:
      isDefaultView && initialProblems
        ? { initialData: initialProblems }
        : undefined,
  });

  const handleRowClick = (problem: ProblemSummary) => {
    if (!problem.slug) {
      return;
    }

    router.push(routerConfig.problem.execute({ slug: problem.slug }));
  };

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
      onRowClick={handleRowClick}
      paginationProps={{ showSelectionSummary: false }}
      manualPagination={{
        pagination: { pageIndex, pageSize },
        onPaginationChange: handlePaginationChange,
        pageCount,
      }}
    />
  );
}

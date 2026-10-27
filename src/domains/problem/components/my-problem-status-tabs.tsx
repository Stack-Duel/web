"use client";

import { Button } from "@/shared/components/ui/button";
import { useMyProblemListStore } from "../state/my-problem-list-store";
import { useMyProblemsMetadata } from "../api/get-my-problems-metadata";
import type { ProblemStatus } from "../models/admin-problem";

const STATUS_ORDER: ProblemStatus[] = [
  "Draft",
  "Published",
  "Archived",
  "Pending",
  "Failed",
];

export default function MyProblemStatusTabs() {
  const statusFilter = useMyProblemListStore((s) => s.statusFilter);
  const setStatusFilter = useMyProblemListStore((s) => s.setStatusFilter);
  const toggleStatusFilter = useMyProblemListStore(
    (s) => s.toggleStatusFilter
  );
  const { data } = useMyProblemsMetadata();

  const countByStatus = new Map(
    data?.statusBreakdown.map((entry) => [entry.status, entry.count]) ?? []
  );
  const total = data?.statusBreakdown.reduce(
    (sum, entry) => sum + entry.count,
    0
  );
  const isAllSelected = statusFilter.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        type="button"
        size="sm"
        variant={isAllSelected ? "default" : "outline"}
        onClick={() => setStatusFilter([])}
      >
        All{total !== undefined ? ` (${total})` : ""}
      </Button>
      {STATUS_ORDER.map((status) => (
        <Button
          key={status}
          type="button"
          size="sm"
          variant={statusFilter.includes(status) ? "default" : "outline"}
          onClick={() => toggleStatusFilter(status)}
        >
          {status} ({countByStatus.get(status) ?? 0})
        </Button>
      ))}
    </div>
  );
}

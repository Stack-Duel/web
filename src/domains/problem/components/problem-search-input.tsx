"use client";

import { Input } from "@/shared/components/ui/input";
import { useProblemListStore } from "../state/problem-list-store";

export default function ProblemSearchInput() {
  const search = useProblemListStore((s) => s.search);
  const setSearch = useProblemListStore((s) => s.setSearch);

  return (
    <Input
      placeholder="Search by title or slug..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="max-w-sm"
    />
  );
}

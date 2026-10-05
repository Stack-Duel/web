"use client";

import { Input } from "@/shared/components/ui/input";
import { useAdminProblemListStore } from "../state/admin-problem-list-store";

export default function AdminProblemSearchInput() {
  const search = useAdminProblemListStore((s) => s.search);
  const setSearch = useAdminProblemListStore((s) => s.setSearch);

  return (
    <Input
      placeholder="Search by title, slug, or ID..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="max-w-sm"
    />
  );
}

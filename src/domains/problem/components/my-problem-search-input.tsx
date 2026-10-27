"use client";

import { Input } from "@/shared/components/ui/input";
import { useMyProblemListStore } from "../state/my-problem-list-store";

export default function MyProblemSearchInput() {
  const search = useMyProblemListStore((s) => s.search);
  const setSearch = useMyProblemListStore((s) => s.setSearch);

  return (
    <Input
      placeholder="Search by title, slug, or ID..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full @md:max-w-sm"
    />
  );
}

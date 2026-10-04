"use client";

import { Input } from "@/shared/components/ui/input";
import { useAdminUserListStore } from "../state/admin-user-list-store";

export default function AdminUserSearchInput() {
  const search = useAdminUserListStore((s) => s.search);
  const setSearch = useAdminUserListStore((s) => s.setSearch);

  return (
    <Input
      placeholder="Search by username or ID..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="max-w-sm"
    />
  );
}

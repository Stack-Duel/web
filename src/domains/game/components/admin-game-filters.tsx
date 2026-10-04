"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useAdminGameListStore } from "../state/admin-game-list-store";
import { GameStatus } from "../models/game";

const STATUS_OPTIONS: { value: GameStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: GameStatus.Pending, label: "Pending" },
  { value: GameStatus.Running, label: "Running" },
  { value: GameStatus.Completed, label: "Completed" },
  { value: GameStatus.Cancelled, label: "Cancelled" },
];

export default function AdminGameFilters() {
  const statusFilter = useAdminGameListStore((s) => s.statusFilter);
  const setStatusFilter = useAdminGameListStore((s) => s.setStatusFilter);

  return (
    <Select
      value={statusFilter}
      onValueChange={(value) => setStatusFilter(value as GameStatus | "all")}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

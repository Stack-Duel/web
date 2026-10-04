"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useAdminFeedbackListStore } from "../state/admin-feedback-list-store";
import type { FeedbackStatus, FeedbackType } from "../models/feedback";

const TYPE_OPTIONS: { value: FeedbackType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "Bug", label: "Bug" },
  { value: "FeatureRequest", label: "Feature request" },
  { value: "Question", label: "Question" },
  { value: "General", label: "General" },
];

const STATUS_OPTIONS: { value: FeedbackStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "New", label: "New" },
  { value: "Triaged", label: "Triaged" },
  { value: "InProgress", label: "In progress" },
  { value: "Resolved", label: "Resolved" },
  { value: "WontFix", label: "Won't fix" },
];

export default function AdminFeedbackFilters() {
  const typeFilter = useAdminFeedbackListStore((s) => s.typeFilter);
  const statusFilter = useAdminFeedbackListStore((s) => s.statusFilter);
  const setTypeFilter = useAdminFeedbackListStore((s) => s.setTypeFilter);
  const setStatusFilter = useAdminFeedbackListStore((s) => s.setStatusFilter);

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={typeFilter}
        onValueChange={(value) => setTypeFilter(value as FeedbackType | "all")}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={statusFilter}
        onValueChange={(value) =>
          setStatusFilter(value as FeedbackStatus | "all")
        }
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
    </div>
  );
}

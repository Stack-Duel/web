"use client";

import { Input } from "@/shared/components/ui/input";
import { useAdminSubmissionListStore } from "../state/admin-submission-list-store";

const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidGuid(value: string) {
  return GUID_REGEX.test(value.trim());
}

export default function AdminSubmissionSearchInput() {
  const searchId = useAdminSubmissionListStore((s) => s.searchId);
  const setSearchId = useAdminSubmissionListStore((s) => s.setSearchId);
  const trimmed = searchId.trim();
  const isInvalid = trimmed.length > 0 && !isValidGuid(trimmed);

  return (
    <div className="flex w-full max-w-sm flex-col gap-1">
      <Input
        placeholder="Search by submission ID..."
        value={searchId}
        aria-invalid={isInvalid}
        onChange={(e) => setSearchId(e.target.value)}
      />
      {isInvalid ? (
        <span className="text-xs text-destructive">
          Not a valid submission ID. Must be a full GUID.
        </span>
      ) : null}
    </div>
  );
}

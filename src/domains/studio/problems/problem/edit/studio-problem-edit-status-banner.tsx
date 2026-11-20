"use client";

import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import type { StudioProblemDetails } from "@/domains/studio/models/studio-problem-details";

const LIVE_STATUSES: StudioProblemDetails["status"][] = [
  "Published",
  "Archived",
];

export default function StudioProblemEditStatusBanner({
  details,
}: Readonly<{ details: StudioProblemDetails }>) {
  if (!LIVE_STATUSES.includes(details.status)) return null;

  return (
    <Alert>
      <TriangleAlert className="size-4" />
      <AlertDescription>
        <span className="font-medium">This problem is live.</span> Edits to the
        question or limits affect players immediately. Changing setups, sample
        cases, or generation parameters requires re-validation before they take
        effect.
      </AlertDescription>
    </Alert>
  );
}

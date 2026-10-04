"use client";

import { useState } from "react";
import AdminSubmissionStepList from "./admin-submission-step-list";
import AdminSubmissionStepDetail from "./admin-submission-step-detail";
import type { AdminSubmissionJob } from "../models/admin-submission";

type AdminSubmissionPipelineViewProps = {
  job: AdminSubmissionJob | null;
};

export default function AdminSubmissionPipelineView({
  job,
}: Readonly<AdminSubmissionPipelineViewProps>) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    job?.currentStepId ?? job?.steps.at(-1)?.stepId ?? null
  );

  if (!job) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No pipeline job found for this submission.
      </div>
    );
  }

  const selectedStep = job.steps.find((s) => s.stepId === selectedStepId);

  return (
    <div className="grid min-h-0 grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
      <AdminSubmissionStepList
        steps={job.steps}
        selectedStepId={selectedStepId}
        onSelectStep={setSelectedStepId}
      />
      <AdminSubmissionStepDetail step={selectedStep} />
    </div>
  );
}

"use client";

import SubmissionStatusPanel from "@/domains/submission/components/submission-status-panel";
import {
  useWorkspaceStore,
  selectActiveSubmissionId,
  selectIsSubmittingSubmission,
} from "@/domains/workspace/state/workspace-store";
import { useViewingSubmissionId } from "../../hooks/use-viewing-submission-id";

export default function RampSubmissionTab({
  gameId,
  viewingProblemId,
  isViewingHistory,
}: Readonly<{
  gameId: string;
  viewingProblemId: string | null;
  isViewingHistory: boolean;
}>) {
  const activeSubmissionId = useWorkspaceStore(selectActiveSubmissionId);
  const isSubmittingSubmission = useWorkspaceStore(
    selectIsSubmittingSubmission
  );
  const viewingSubmissionId = useViewingSubmissionId(gameId, viewingProblemId);
  const displaySubmissionId = isViewingHistory
    ? viewingSubmissionId
    : activeSubmissionId;

  return (
    <SubmissionStatusPanel
      submissionId={displaySubmissionId}
      isSubmitting={!isViewingHistory && isSubmittingSubmission}
    />
  );
}

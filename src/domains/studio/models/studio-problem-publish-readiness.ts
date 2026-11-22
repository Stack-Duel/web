export type ProblemValidationJobStatus =
  "Pending" | "AwaitingGeneration" | "Completed" | "Failed" | "Cancelled";

export type ProblemValidationStepKind =
  "AuthorChecks" | "ReferenceSolutions" | "TestCaseGeneration" | "Publish";

export type ProblemValidationStepStatus =
  "Pending" | "Running" | "Succeeded" | "Failed" | "Skipped" | "Cancelled";

export interface ProblemValidationStepItem {
  label: string;
  status: ProblemValidationStepStatus;
  detail: string | null;
}

export interface ProblemValidationStep {
  kind: ProblemValidationStepKind;
  status: ProblemValidationStepStatus;
  startedAt: string | null;
  completedAt: string | null;
  detail: string | null;
  items: ProblemValidationStepItem[];
}

export interface StudioProblemPublishReadiness {
  canSubmit: boolean;
  isReady: boolean;
  requirementsMet: number;
  requirementCount: number;
  setupCount: number;
  languagesMissingReferenceSolution: string[];
  sampleTestCaseCount: number;
  hasGenerationParameters: boolean;
  attemptCount: number;
  lastSubmittedAt: string | null;
  lastCompletedAt: string | null;
  lastAttemptStatus: ProblemValidationJobStatus | null;
  lastFailureReason: string | null;
  steps: ProblemValidationStep[] | null;
  processingAttempts: number;
  lastError: string | null;
  hasUnpublishedChanges: boolean;
  isRevalidating: boolean;
}

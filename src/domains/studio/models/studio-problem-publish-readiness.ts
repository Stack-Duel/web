export type ProblemValidationJobStatus =
  "Pending" | "AwaitingGeneration" | "Completed" | "Failed";

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
}

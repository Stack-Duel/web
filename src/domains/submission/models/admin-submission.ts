import type {
  SubmissionResultStatus,
  SubmissionStatus,
} from "./submission-status";

export type SubmissionType = "Run" | "Submit";

export interface SubmissionLanguage {
  id: string;
  name: string;
  version: string;
}

export interface SubmissionUser {
  username: string;
  imageUrl: string | null;
}

export interface AdminSubmissionListItem {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  problemSetupId: string;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  language: SubmissionLanguage;
  user: SubmissionUser;
  createdAt: string;
  memoryUsage: number | null;
  executionTime: number | null;
}

export type SubmissionJobStatus =
  "Pending" | "Running" | "Completed" | "Failed";
export type SubmissionJobAttemptStatus =
  "Processing" | "Succeeded" | "Failed" | "Abandoned";
export type ExecutionPipelineStepType =
  "Judge0Execute" | "Judge0Poll" | "Evaluate" | "ParseOutput";
export type AdminSubmissionJobStepStatus =
  "Pending" | "Running" | "Succeeded" | "Failed";

export interface AdminSubmissionJobAttempt {
  attemptNumber: number;
  status: SubmissionJobAttemptStatus;
  requestPayload: string | null;
  responsePayload: string | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
}

export interface AdminSubmissionJobStep {
  stepId: string;
  name: string;
  stepType: ExecutionPipelineStepType;
  stepOrder: number;
  maxAttempts: number;
  timeoutSeconds: number;
  isPolling: boolean;
  isCurrent: boolean;
  status: AdminSubmissionJobStepStatus;
  attemptCount: number;
  totalDurationMs: number | null;
  attempts: AdminSubmissionJobAttempt[];
}

export interface AdminSubmissionJob {
  id: string;
  status: SubmissionJobStatus;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
  currentStepId: string | null;
  steps: AdminSubmissionJobStep[];
}

export interface AdminSubmissionResult {
  testCaseId: string;
  status: SubmissionResultStatus;
  runtime: number | null;
  memoryUsed: number | null;
  actualOutput: string | null;
  standardOutput: string | null;
  standardError: string | null;
  compileOutput: string | null;
}

export interface AdminSubmissionDetail extends AdminSubmissionListItem {
  sourceCode: string;
  results: AdminSubmissionResult[];
  job: AdminSubmissionJob | null;
}

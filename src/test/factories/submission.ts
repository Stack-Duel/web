import type {
  AdminSubmissionDetail,
  AdminSubmissionJob,
  AdminSubmissionJobAttempt,
  AdminSubmissionJobStep,
  AdminSubmissionListItem,
  AdminSubmissionResult,
} from "@/domains/submission/models/admin-submission";

export function buildAdminSubmissionListItem(
  overrides: Partial<AdminSubmissionListItem> = {}
): AdminSubmissionListItem {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    type: "Submit",
    status: "Accepted",
    problemSetupId: "setup_1",
    problemId: "problem_1",
    problemTitle: "Two Sum",
    problemSlug: "two-sum",
    language: { id: "lang_1", name: "JavaScript", version: "ES2022" },
    user: { username: "testuser", imageUrl: null },
    createdAt: "2026-01-01T00:00:00.000Z",
    memoryUsage: 512,
    executionTime: 12,
    ...overrides,
  };
}

export function buildAdminSubmissionJobAttempt(
  overrides: Partial<AdminSubmissionJobAttempt> = {}
): AdminSubmissionJobAttempt {
  return {
    attemptNumber: 1,
    status: "Succeeded",
    requestPayload: '{"input":1}',
    responsePayload: '{"output":2}',
    error: null,
    startedAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:00:01.000Z",
    durationMs: 1000,
    ...overrides,
  };
}

export function buildAdminSubmissionJobStep(
  overrides: Partial<AdminSubmissionJobStep> = {}
): AdminSubmissionJobStep {
  return {
    stepId: "step_1",
    name: "Judge0 Execute",
    stepType: "Judge0Execute",
    stepOrder: 1,
    maxAttempts: 3,
    timeoutSeconds: 30,
    isPolling: false,
    isCurrent: false,
    status: "Succeeded",
    attemptCount: 1,
    totalDurationMs: 1000,
    attempts: [buildAdminSubmissionJobAttempt()],
    ...overrides,
  };
}

export function buildAdminSubmissionJob(
  overrides: Partial<AdminSubmissionJob> = {}
): AdminSubmissionJob {
  return {
    id: "job_1",
    status: "Completed",
    failureReason: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:00:02.000Z",
    currentStepId: null,
    steps: [buildAdminSubmissionJobStep()],
    ...overrides,
  };
}

export function buildAdminSubmissionResult(
  overrides: Partial<AdminSubmissionResult> = {}
): AdminSubmissionResult {
  return {
    testCaseId: "test_1",
    status: "Accepted",
    runtime: 12,
    memoryUsed: 512,
    actualOutput: "[0,1]",
    standardOutput: null,
    standardError: null,
    compileOutput: null,
    ...overrides,
  };
}

export function buildAdminSubmissionDetail(
  overrides: Partial<AdminSubmissionDetail> = {}
): AdminSubmissionDetail {
  return {
    ...buildAdminSubmissionListItem(),
    sourceCode: "function twoSum() {}",
    results: [buildAdminSubmissionResult()],
    job: buildAdminSubmissionJob(),
    ...overrides,
  };
}

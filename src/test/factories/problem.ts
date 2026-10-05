import type {
  AdminProblemDetail,
  AdminProblemListItem,
  AdminProblemSetup,
  ProblemStatus,
} from "@/domains/problem/models/admin-problem";
import type { ProblemPool } from "@/domains/problem/models/problem-pool";
import type { ProblemSetup } from "@/domains/problem/models/problem-setup";
import type { ProblemSummary } from "@/domains/problem/models/problem-summary";
import type { Problem, PublicTestCase } from "@/domains/problem/models/problem";
import type { ProblemSubmission } from "@/domains/problem/problem-submissions/models/problem-submission";

export function buildAdminProblemListItem(
  overrides: Partial<AdminProblemListItem> = {}
): AdminProblemListItem {
  return {
    id: "problem_1",
    slug: "two-sum",
    title: "Two Sum",
    difficultyValue: 1,
    difficultyTier: "easy",
    status: "Draft" as ProblemStatus,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tags: ["arrays"],
    languages: ["JavaScript"],
    setupCount: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdByUsername: "admin",
    ...overrides,
  };
}

export function buildAdminProblemSetup(
  overrides: Partial<AdminProblemSetup> = {}
): AdminProblemSetup {
  return {
    id: "setup_1",
    languageVersionId: "lang_1",
    languageName: "JavaScript",
    languageVersion: "ES2022",
    functionName: "twoSum",
    initialCode: "function twoSum(nums, target) {}",
    referenceSolutionCode: null,
    hasReferenceSolution: true,
    hasGenerationSpec: false,
    testSuiteCount: 2,
    testCaseCount: 10,
    sampleTestCases: [],
    ...overrides,
  };
}

export function buildAdminProblemDetail(
  overrides: Partial<AdminProblemDetail> = {}
): AdminProblemDetail {
  return {
    id: "problem_1",
    slug: "two-sum",
    title: "Two Sum",
    question: "Given an array of integers...",
    difficultyValue: 1,
    difficultyTier: "easy",
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    status: "Draft" as ProblemStatus,
    validationFailureReason: null,
    trackId: "track_1",
    trackName: "General Purpose",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdByUsername: "admin",
    tags: ["arrays"],
    poolKeys: [],
    setups: [],
    generationParameters: [],
    generationOutputValueType: null,
    generationTargetCaseCount: null,
    generationSeed: null,
    ...overrides,
  };
}

export function buildProblemPool(
  overrides: Partial<ProblemPool> = {}
): ProblemPool {
  return {
    id: "pool_1",
    key: "daily",
    name: "Daily challenge",
    description: undefined,
    problemCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function buildProblemSummary(
  overrides: Partial<ProblemSummary> = {}
): ProblemSummary {
  return {
    id: "problem_1",
    slug: "two-sum",
    title: "Two Sum",
    difficultyTier: "easy",
    tags: ["arrays"],
    languages: [{ id: "lang_1", name: "JavaScript", slug: "javascript" }],
    ...overrides,
  };
}

export function buildProblemSetup(
  overrides: Partial<ProblemSetup> = {}
): ProblemSetup {
  return {
    id: "setup_1",
    initialCode: "function twoSum(nums, target) {}",
    functionName: null,
    additionalFiles: [],
    ...overrides,
  };
}

export function buildPublicTestCase(
  overrides: Partial<PublicTestCase> = {}
): PublicTestCase {
  return {
    name: "Example 1",
    description: "Basic case",
    inputs: [{ value: "[2,7,11,15]", valueType: "int[]" }],
    expectedOutputs: [{ value: "[0,1]", valueType: "int[]" }],
    ...overrides,
  };
}

export function buildProblem(overrides: Partial<Problem> = {}): Problem {
  return {
    id: "problem_1",
    slug: "two-sum",
    title: "Two Sum",
    difficultyTier: "easy",
    question: "Given an array of integers...",
    availableLanguages: [],
    publicTestCases: [buildPublicTestCase()],
    setups: [],
    author: { username: "algowars", imageUrl: null },
    tags: ["arrays"],
    ...overrides,
  };
}

export function buildProblemSubmission(
  overrides: Partial<ProblemSubmission> = {}
): ProblemSubmission {
  return {
    id: "submission_1",
    code: "function twoSum() {}",
    user: { username: "testuser", imageUrl: "https://example.com/a.png" },
    status: "Accepted",
    memoryUsage: 512,
    executionTime: 12,
    language: { id: "lang_1", name: "JavaScript", version: "ES2022" },
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

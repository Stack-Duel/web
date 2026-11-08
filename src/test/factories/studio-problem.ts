import type { StudioProblemDetails } from "@/domains/studio/models/studio-problem-details";

export function buildStudioProblemDetails(
  overrides: Partial<StudioProblemDetails> = {}
): StudioProblemDetails {
  return {
    problemId: "problem_1",
    slug: "two-sum",
    title: "Two Sum",
    difficultyValue: 1,
    difficultyTier: "Easy",
    status: "Published",
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    setupCount: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    reactionCount: 0,
    attemptCount: 0,
    solveRatePercent: 0,
    question: "Given an array of integers...",
    ...overrides,
  };
}

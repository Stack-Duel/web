export interface StudioProblemDetails {
  problemId: string;
  slug: string;
  title: string;
  difficultyValue: number;
  difficultyTier: "Beginner" | "Easy" | "Intermediate" | "Advanced" | "Expert";
  status: "Draft" | "Pending" | "Published" | "Failed" | "Archived";
  timeLimitMs: number;
  memoryLimitMb: number;
  setupCount: number;
  createdAt: string;
  reactionCount: number;
  attemptCount: number;
  solveRatePercent: number;
  question: string;
}

import { GenerationParameter } from "@/domains/problem/models/generation-parameters";
import { StudioProblemPublishReadiness } from "./studio-problem-publish-readiness";

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
  publishReadiness: StudioProblemPublishReadiness | null;
  trackId: string | null;
  tags: string[] | null;
  generationParameters: GenerationParameter[] | null;
  generationOutputValueType: string | null;
  generationTargetCaseCount: number | null;
  generationSeed: number | null;
}

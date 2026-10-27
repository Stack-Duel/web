import type { ProblemStatus } from "./admin-problem";

export interface MyProblemListItem {
  id: string;
  slug: string;
  title: string;
  difficultyValue: number;
  difficultyTier: string;
  status: ProblemStatus;
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
  languages: string[];
  setupCount: number;
  createdAt: string;
}

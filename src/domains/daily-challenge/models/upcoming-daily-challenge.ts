import type { ProblemStatus } from "@/domains/problem/models/admin-problem";

export type UpcomingDailyChallenge = {
  date: string;
  problemId: string;
  problemSlug: string;
  problemTitle: string;
  difficultyTier: string;
  status: ProblemStatus;
};

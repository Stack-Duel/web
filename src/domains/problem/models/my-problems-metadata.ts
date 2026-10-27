import type { ProblemStatus } from "./admin-problem";

export interface ProblemReactionCount {
  key: string;
  name: string;
  emoji: string | null;
  count: number;
}

export interface ProblemStatusCount {
  status: ProblemStatus;
  count: number;
}

export interface MyProblemsMetadata {
  totalSubmissions: number;
  totalReactions: number;
  reactionBreakdown: ProblemReactionCount[];
  statusBreakdown: ProblemStatusCount[];
  averageCompletionRate: number;
}

export interface ProblemReactionCount {
  key: string;
  name: string;
  emoji: string | null;
  count: number;
}

export interface ProblemReactionSummary {
  counts: ProblemReactionCount[];
  currentUserReactionKey: string | null;
}

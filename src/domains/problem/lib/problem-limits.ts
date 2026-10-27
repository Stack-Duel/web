import type { ProblemStatusCount } from "../models/my-problems-metadata";

export const MAX_OPEN_PROBLEMS_PER_CREATOR = 10;

const RESOLVED_STATUSES = new Set(["Published", "Archived"]);

export function getOpenProblemCount(
  statusBreakdown: ProblemStatusCount[]
): number {
  return statusBreakdown
    .filter((entry) => !RESOLVED_STATUSES.has(entry.status))
    .reduce((sum, entry) => sum + entry.count, 0);
}

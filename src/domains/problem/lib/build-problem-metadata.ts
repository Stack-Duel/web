import { siteName } from "@/shared/lib/site";
import type { Problem } from "../models/problem";

const MAX_DESCRIPTION_TAGS = 3;
const MAX_DESCRIPTION_LENGTH = 160;

export function buildProblemDescription(
  problem: Pick<Problem, "title" | "difficultyTier" | "tags">
): string {
  const base = `Solve "${problem.title}" (${problem.difficultyTier}) on ${siteName}, an online competitive coding platform for code battles and algorithm practice.`;

  if (!problem.tags?.length) return base;

  const tagsPhrase = ` Topics: ${problem.tags.slice(0, MAX_DESCRIPTION_TAGS).join(", ")}.`;
  const withTags = base + tagsPhrase;

  return withTags.length <= MAX_DESCRIPTION_LENGTH ? withTags : base;
}

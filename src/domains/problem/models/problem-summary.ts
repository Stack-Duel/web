export interface ProblemLanguageSummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProblemSummary {
  id: string;
  slug: string;
  title: string;
  difficultyTier: string;
  tags: string[];
  languages: ProblemLanguageSummary[];
  question?: string;
}

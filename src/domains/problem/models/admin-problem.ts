import type { SampleTestCase } from "./sample-test-case";
import type { GenerationParameter } from "./generation-parameters";

export type ProblemStatus =
  "Draft" | "Published" | "Archived" | "Pending" | "Failed";

export interface AdminProblemListItem {
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
  createdByUsername?: string;
}

export interface AdminProblemSetup {
  id: string;
  languageVersionId: string;
  languageName: string;
  languageVersion: string;
  functionName: string | null;
  initialCode: string;
  referenceSolutionCode: string | null;
  hasReferenceSolution: boolean;
  hasGenerationSpec: boolean;
  testSuiteCount: number;
  testCaseCount: number;
  sampleTestCases: SampleTestCase[];
}

export interface AdminProblemDetail {
  id: string;
  slug: string;
  title: string;
  question: string;
  difficultyValue: number;
  difficultyTier: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  status: ProblemStatus;
  validationFailureReason: string | null;
  trackId: string | null;
  trackName: string | null;
  createdAt: string;
  createdByUsername?: string;
  tags: string[];
  poolKeys: string[];
  setups: AdminProblemSetup[];
  generationParameters: GenerationParameter[];
  generationOutputValueType: string | null;
  generationTargetCaseCount: number | null;
  generationSeed: number | null;
}

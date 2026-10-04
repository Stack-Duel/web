import { ProgrammingLanguage } from "@/domains/language/models/programming-language";

export interface ProblemSetupOption {
  id: string;
  language: string;
  initialCode: string;
  [key: string]: unknown;
}

export interface ProblemAuthor {
  username: string;
  imageUrl?: string | null;
}

export interface PublicTestCaseInput {
  value: string;
  valueType: string;
}

export interface PublicTestCaseExpectedOutput {
  value: string;
  valueType: string;
}

export interface PublicTestCase {
  name: string;
  description?: string | null;
  inputs: PublicTestCaseInput[];
  expectedOutputs: PublicTestCaseExpectedOutput[];
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficultyTier: string;
  question: string;
  availableLanguages: ProgrammingLanguage[];
  publicTestCases: PublicTestCase[];
  setups?: ProblemSetupOption[];
  author?: ProblemAuthor | null;
  tags?: string[];
}

import type { SampleTestCase } from "@/domains/problem/models/sample-test-case";

export interface StudioProblemSetup {
  languageVersionId: string;
  languageVersion: string;
  languageId: string;
  language: string;
  starterCode: string;
  functionName: string;
  referenceSolution: string;
  amountOfTestSuites: string;
  amountOfTestCases: string;
  sampleTestCases: SampleTestCase[] | null;
}

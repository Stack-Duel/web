import type { StudioProblemSetup } from "@/domains/studio/models/studio-problem-setup";

export function buildStudioProblemSetup(
  overrides: Partial<StudioProblemSetup> = {}
): StudioProblemSetup {
  return {
    languageVersionId: "lang_version_1",
    languageVersion: "ES2022",
    languageId: "lang_1",
    language: "JavaScript",
    starterCode: "function twoSum(nums, target) {}",
    functionName: "twoSum",
    referenceSolution: "",
    amountOfTestSuites: "0",
    amountOfTestCases: "0",
    ...overrides,
  };
}

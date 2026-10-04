import type { ProgrammingLanguage } from "@/domains/language/models/programming-language";

export function buildProgrammingLanguage(
  overrides: Partial<ProgrammingLanguage> = {}
): ProgrammingLanguage {
  return {
    id: "lang_1",
    name: "TypeScript",
    versions: [{ id: "ver_1", version: "5.0" }],
    ...overrides,
  };
}

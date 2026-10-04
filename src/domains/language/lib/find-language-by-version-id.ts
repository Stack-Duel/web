import { ProgrammingLanguage } from "../models/programming-language";

export function findLanguageByVersionId(
  languages: ProgrammingLanguage[],
  versionId: string | null
): ProgrammingLanguage | undefined {
  return languages.find((l) => l.versions.some((v) => v.id === versionId));
}

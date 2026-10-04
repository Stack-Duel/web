export interface ProgrammingLanguage {
  id: string;
  name: string;
  versions: ProgrammingLanguageVersion[];
}

export interface ProgrammingLanguageVersion {
  id: string;
  version: string;
}

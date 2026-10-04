export interface ProblemSetupFile {
  path: string;
  content: string;
}

export interface ProblemSetup {
  id: string;
  initialCode: string;
  functionName: string | null;
  additionalFiles: ProblemSetupFile[];
}

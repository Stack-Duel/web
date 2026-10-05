export type RunTestCaseInputRequest = {
  inputs: string[];
};

export type SubmissionFileRequest = {
  path: string;
  content: string;
};

export type CreateRunSubmissionRequest = {
  problemSetupId: string;
  code: string;
  customTestCases?: RunTestCaseInputRequest[];
  additionalFiles?: SubmissionFileRequest[];
};

export type CreateGradeSubmissionRequest = {
  problemSetupId: string;
  code: string;
  additionalFiles?: SubmissionFileRequest[];
};

export type SubmissionResultStatus =
  | "Pending"
  | "Processing"
  | "Accepted"
  | "WrongAnswer"
  | "TimeLimitExceeded"
  | "MemoryLimitExceeded"
  | "RuntimeError"
  | "CompileError";

export type SubmissionStatus =
  "Queued" | "Running" | "Accepted" | "WrongAnswer";

export type SubmissionResultStatusDto = {
  status: SubmissionResultStatus;
  runtime: number | null;
  memoryUsed: number | null;
  input: string | null;
  actualOutput: string | null;
  expectedOutput: string | null;
  standardOutput: string | null;
  standardError: string | null;
  compileOutput: string | null;
};

export type SubmissionStatusDto = {
  submissionId: string;
  problemSetupId: string;
  status: SubmissionStatus;
  code: string;
  results: SubmissionResultStatusDto[];
};

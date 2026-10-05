export interface ProblemSubmission {
  id: string;
  code: string;
  user: ProblemSubmissionUser;
  status: string;
  memoryUsage?: number;
  executionTime?: number;
  language: ProblemSubmissionLanguage;
  createdAt: Date;
}

export interface ProblemSubmissionLanguage {
  id: string;
  name: string;
  version: string;
}

export interface ProblemSubmissionUser {
  username: string;
  imageUrl: string;
}

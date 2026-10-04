import type {
  SubmissionResultStatus,
  SubmissionStatus,
} from "../models/submission-status";

const destructiveStatuses = new Set<string>([
  "WrongAnswer",
  "TimeLimitExceeded",
  "MemoryLimitExceeded",
  "RuntimeError",
  "CompileError",
]);

export const getSubmissionStatusVariant = (
  status: SubmissionStatus | SubmissionResultStatus
) =>
  destructiveStatuses.has(status)
    ? ("destructive" as const)
    : ("secondary" as const);

export const getSubmissionStatusClassName = (
  status: SubmissionStatus | SubmissionResultStatus
) =>
  status === "Accepted"
    ? "bg-green-600 text-white hover:bg-green-600/90"
    : undefined;

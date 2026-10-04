import { Badge } from "@/shared/components/ui/badge";
import AdminSubmissionAttemptPayload from "./admin-submission-attempt-payload";
import type {
  AdminSubmissionJobAttempt,
  SubmissionJobAttemptStatus,
  AdminSubmissionJobStep,
} from "../models/admin-submission";

export function formatDurationMs(durationMs: number | null) {
  if (durationMs === null) {
    return "-";
  }

  return durationMs >= 1000
    ? `${(durationMs / 1000).toFixed(2)}s`
    : `${durationMs}ms`;
}

function getAttemptStatusVariant(status: SubmissionJobAttemptStatus) {
  if (status === "Succeeded") {
    return "default" as const;
  }

  if (status === "Failed" || status === "Abandoned") {
    return "destructive" as const;
  }

  return "secondary" as const;
}

function getAttemptStatusClassName(status: SubmissionJobAttemptStatus) {
  return status === "Succeeded"
    ? "bg-green-600 text-white hover:bg-green-600/90"
    : undefined;
}

function AttemptCard({
  attempt,
}: Readonly<{ attempt: AdminSubmissionJobAttempt }>) {
  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">
          Attempt {attempt.attemptNumber}
        </h4>
        <Badge
          variant={getAttemptStatusVariant(attempt.status)}
          className={getAttemptStatusClassName(attempt.status)}
        >
          {attempt.status}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Started
          </p>
          <p className="mt-1 text-sm">
            {new Date(attempt.startedAt).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Completed
          </p>
          <p className="mt-1 text-sm">
            {attempt.completedAt
              ? new Date(attempt.completedAt).toLocaleString()
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Duration
          </p>
          <p className="mt-1 text-sm">{formatDurationMs(attempt.durationMs)}</p>
        </div>
      </div>

      {attempt.error ? (
        <div className="space-y-1">
          <h5 className="text-xs font-medium uppercase tracking-wide text-destructive">
            Error
          </h5>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-sm text-destructive">
            {attempt.error}
          </pre>
        </div>
      ) : null}

      <AdminSubmissionAttemptPayload
        title="Request Payload"
        value={attempt.requestPayload}
      />
      <AdminSubmissionAttemptPayload
        title="Response Payload"
        value={attempt.responsePayload}
      />
    </div>
  );
}

type AdminSubmissionStepDetailProps = {
  step: AdminSubmissionJobStep | undefined;
};

export default function AdminSubmissionStepDetail({
  step,
}: Readonly<AdminSubmissionStepDetailProps>) {
  if (!step) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Select a step to see its attempts.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{step.name}</h3>
        <span className="text-xs text-muted-foreground">{step.stepType}</span>
      </div>

      {step.attempts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          This step has not started yet.
        </p>
      ) : (
        <div className="space-y-3">
          {step.attempts.map((attempt) => (
            <AttemptCard key={attempt.attemptNumber} attempt={attempt} />
          ))}
        </div>
      )}
    </div>
  );
}

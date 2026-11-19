"use client";

import { Check, CircleDashed, LoaderCircle, Minus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { StudioProblemDetails } from "@/domains/studio/models/studio-problem-details";
import type {
  ProblemValidationStep,
  ProblemValidationStepItem,
  ProblemValidationStepKind,
  ProblemValidationStepStatus,
  StudioProblemPublishReadiness,
} from "@/domains/studio/models/studio-problem-publish-readiness";

const STEP_LABELS: Record<ProblemValidationStepKind, string> = {
  AuthorChecks: "Author checks",
  ReferenceSolutions: "Reference solutions",
  TestCaseGeneration: "Test case generation",
  Publish: "Publish",
};

const STEP_ORDER: ProblemValidationStepKind[] = [
  "AuthorChecks",
  "ReferenceSolutions",
  "TestCaseGeneration",
  "Publish",
];

const STEP_FALLBACK_DETAIL: Record<ProblemValidationStepKind, string> = {
  AuthorChecks: "Setups, sample cases and generation parameters are present.",
  ReferenceSolutions:
    "Every reference solution runs against every sample case.",
  TestCaseGeneration: "The hidden cases are generated from your parameters.",
  Publish: "The problem goes live once generation finishes.",
};

const STATUS_LABELS: Record<ProblemValidationStepStatus, string> = {
  Pending: "waiting",
  Running: "running",
  Succeeded: "done",
  Failed: "failed",
  Skipped: "not reached",
};

function StepIcon({
  status,
}: Readonly<{ status: ProblemValidationStepStatus }>) {
  const label = STATUS_LABELS[status];

  switch (status) {
    case "Succeeded":
      return (
        <Check
          size={16}
          className="text-emerald-600 dark:text-emerald-400"
          aria-label={label}
        />
      );
    case "Running":
      return (
        <LoaderCircle
          size={16}
          className="animate-spin text-amber-600 dark:text-amber-500"
          aria-label={label}
        />
      );
    case "Failed":
      return <X size={16} className="text-destructive" aria-label={label} />;
    case "Skipped":
      return (
        <Minus size={16} className="text-muted-foreground" aria-label={label} />
      );
    case "Pending":
      return (
        <CircleDashed
          size={16}
          className="text-muted-foreground"
          aria-label={label}
        />
      );
  }
}

function formatDuration(step: ProblemValidationStep) {
  if (!step.startedAt || !step.completedAt) return null;

  const elapsedMs =
    new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime();

  if (elapsedMs < 1000) return `${elapsedMs}ms`;

  return `${(elapsedMs / 1000).toFixed(1)}s`;
}

function StepItemRow({ item }: Readonly<{ item: ProblemValidationStepItem }>) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 shrink-0">
        <StepIcon status={item.status} />
      </span>
      <span className="min-w-0">
        <span className="font-medium">{item.label}</span>
        {item.detail && (
          <span className="text-muted-foreground"> · {item.detail}</span>
        )}
      </span>
    </li>
  );
}

/**
 * Steps come from the validation job itself. A run submitted before steps were recorded has
 * none, so the stage list falls back to what the job status alone can tell us.
 */
function toSteps(readiness: StudioProblemPublishReadiness) {
  if (readiness.steps && readiness.steps.length > 0) {
    return [...readiness.steps].sort(
      (a, b) => STEP_ORDER.indexOf(a.kind) - STEP_ORDER.indexOf(b.kind)
    );
  }

  const reached = {
    Pending: 1,
    AwaitingGeneration: 2,
    Completed: 4,
    Failed: 1,
  }[readiness.lastAttemptStatus ?? "Pending"];

  const hasFailed = readiness.lastAttemptStatus === "Failed";

  return STEP_ORDER.map((kind, index): ProblemValidationStep => {
    let status: ProblemValidationStepStatus;

    if (index < reached) status = "Succeeded";
    else if (index === reached) status = hasFailed ? "Failed" : "Running";
    else status = "Pending";

    return {
      kind,
      status,
      startedAt: null,
      completedAt: null,
      detail: status === "Failed" ? readiness.lastFailureReason : null,
      items: [],
    };
  });
}

function describeAttempt(readiness: StudioProblemPublishReadiness) {
  const attempt = `Attempt ${readiness.attemptCount}`;

  if (!readiness.lastSubmittedAt) return attempt;

  return `${attempt} · started ${new Date(
    readiness.lastSubmittedAt
  ).toLocaleString()}`;
}

export default function StudioProblemPublishingPipeline({
  details,
}: Readonly<{ details: StudioProblemDetails }>) {
  const readiness = details.publishReadiness;

  if (!readiness) return null;

  const steps = toSteps(readiness);
  const hasFailed = readiness.lastAttemptStatus === "Failed";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hasFailed ? "Publishing failed" : "Publishing"}</CardTitle>
        <CardDescription>{describeAttempt(readiness)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="space-y-3">
          {steps.map((step, index) => {
            const duration = formatDuration(step);

            return (
              <li key={step.kind} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  <StepIcon status={step.status} />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className={cn(
                      "flex flex-wrap items-center gap-x-2 text-sm font-medium",
                      (step.status === "Pending" ||
                        step.status === "Skipped") &&
                        "text-muted-foreground"
                    )}
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                    {STEP_LABELS[step.kind]}
                    {duration && (
                      <span className="font-normal text-muted-foreground">
                        {duration}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {step.detail ?? STEP_FALLBACK_DETAIL[step.kind]}
                  </p>
                  {step.items.length > 0 && (
                    <ul className="space-y-1 pt-1">
                      {step.items.map((item) => (
                        <StepItemRow key={item.label} item={item} />
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <p className="border-t pt-3 text-sm text-muted-foreground">
          {hasFailed
            ? "Editing is unlocked again. Fix the problem, then resubmit to start another attempt."
            : "Editing is locked while validation runs. It usually takes under two minutes."}
        </p>
      </CardContent>
    </Card>
  );
}

"use client";

import { Check, CircleDashed, LoaderCircle, X } from "lucide-react";
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
  ProblemValidationJobStatus,
  StudioProblemPublishReadiness,
} from "@/domains/studio/models/studio-problem-publish-readiness";
import { Button } from "@/shared/components/ui/button";

type StepState = "done" | "running" | "failed" | "waiting";

type PipelineStep = {
  ordinal: string;
  label: string;
  description: string;
  state: StepState;
};

const STEP_ORDER = [
  {
    ordinal: "1",
    label: "Author checks",
    description:
      "Setups, sample cases and generation parameters are all present.",
  },
  {
    ordinal: "2",
    label: "Reference solutions",
    description: "Every reference solution runs against every sample case.",
  },
  {
    ordinal: "3",
    label: "Test case generation",
    description: "The hidden cases are generated from your parameters.",
  },
  {
    ordinal: "4",
    label: "Publish",
    description:
      "The problem goes live in Problems and becomes playable once generation finishes.",
  },
] as const;

function reachedStepIndex(status: ProblemValidationJobStatus | null) {
  switch (status) {
    case "Pending":
      return 1;
    case "AwaitingGeneration":
      return 2;
    case "Completed":
      return 4;
    case "Failed":
    default:
      return 1;
  }
}

function toSteps(readiness: StudioProblemPublishReadiness): PipelineStep[] {
  const status = readiness.lastAttemptStatus;
  const reached = reachedStepIndex(status);
  const hasFailed = status === "Failed";

  return STEP_ORDER.map((step, index) => {
    let state: StepState;

    if (index < reached) {
      state = "done";
    } else if (index === reached) {
      state = hasFailed ? "failed" : "running";
    } else {
      state = "waiting";
    }

    return { ...step, state };
  });
}

function StepIcon({ state }: Readonly<{ state: StepState }>) {
  switch (state) {
    case "done":
      return (
        <Check
          size={16}
          className="text-emerald-600 dark:text-emerald-400"
          aria-label="done"
        />
      );
    case "running":
      return (
        <LoaderCircle
          size={16}
          className="animate-spin text-amber-600 dark:text-amber-500"
          aria-label="running"
        />
      );
    case "failed":
      return <X size={16} className="text-destructive" aria-label="failed" />;
    case "waiting":
      return (
        <CircleDashed
          size={16}
          className="text-muted-foreground"
          aria-label="waiting"
        />
      );
  }
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
  console.log("DETAILS1: ", details);
  const readiness = details.publishReadiness;

  if (!readiness) return null;

  const steps = toSteps(readiness);
  const hasFailed = readiness.lastAttemptStatus === "Failed";

  return (
    <Card>
      <CardHeader className="flex items-start gap-3">
        <div>
          <CardTitle>
            {hasFailed ? "Publishing failed" : "Publishing"}
          </CardTitle>
          <CardDescription>{describeAttempt(readiness)}</CardDescription>
        </div>
        <Button className="ml-auto" variant="outline">
          Cancel
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="space-y-3">
          {steps.map((step) => (
            <li key={step.label} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">
                <StepIcon state={step.state} />
              </span>
              <div className="min-w-0 space-y-0.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.state === "waiting" && "text-muted-foreground"
                  )}
                >
                  <span className="mr-2 font-mono text-xs text-muted-foreground">
                    {step.ordinal}
                  </span>
                  {step.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.state === "failed" && readiness.lastFailureReason
                    ? readiness.lastFailureReason
                    : step.description}
                </p>
              </div>
            </li>
          ))}
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

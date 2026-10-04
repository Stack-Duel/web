import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import StepStatusIcon from "./admin-submission-step-status-icon";
import { formatDurationMs } from "./admin-submission-step-detail";
import type { AdminSubmissionJobStep } from "../models/admin-submission";

type AdminSubmissionStepListProps = {
  steps: AdminSubmissionJobStep[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
};

export default function AdminSubmissionStepList({
  steps,
  selectedStepId,
  onSelectStep,
}: Readonly<AdminSubmissionStepListProps>) {
  return (
    <ol className="flex flex-col gap-1">
      {steps.map((step) => (
        <li key={step.stepId}>
          <button
            type="button"
            onClick={() => onSelectStep(step.stepId)}
            className={cn(
              "flex w-full flex-col gap-1 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
              step.stepId === selectedStepId && "border-primary bg-muted/50",
              step.isCurrent && "border-l-2 border-l-blue-500"
            )}
          >
            <div className="flex items-center gap-2">
              <StepStatusIcon status={step.status} />
              <span className="flex-1 truncate font-medium">{step.name}</span>
            </div>
            <div className="flex items-center gap-2 pl-6 text-xs text-muted-foreground">
              <span>{formatDurationMs(step.totalDurationMs)}</span>
              {step.attemptCount > 1 ? (
                <Badge variant="secondary" className="text-xs">
                  {step.attemptCount} attempts
                </Badge>
              ) : null}
            </div>
          </button>
        </li>
      ))}
    </ol>
  );
}

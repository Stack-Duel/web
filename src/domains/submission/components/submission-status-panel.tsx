"use client";

import type {
  SubmissionResultStatus,
  SubmissionStatus,
} from "@/domains/submission/models/submission-status";
import { useSubmissionStatus } from "@/domains/submission/api/get-submission-status";
import {
  getSubmissionStatusClassName,
  getSubmissionStatusVariant,
} from "@/domains/submission/lib/submission-status-style";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Check, X } from "lucide-react";
import type { WheelEvent } from "react";

const terminalSubmissionStatuses = new Set<string>([
  "Accepted",
  "WrongAnswer",
  "TimeLimitExceeded",
  "MemoryLimitExceeded",
  "RuntimeError",
  "CompileError",
]);
const pendingResultStatuses = new Set<SubmissionResultStatus>([
  "Pending",
  "Processing",
]);

const isPendingSubmissionStatus = (status: SubmissionStatus) =>
  !terminalSubmissionStatuses.has(status);

const isPendingResultStatus = (status: SubmissionResultStatus) =>
  pendingResultStatuses.has(status);

const isFailedResultStatus = (status: SubmissionResultStatus) =>
  !isPendingResultStatus(status) && status !== "Accepted";

const getQueryErrorMessage = (error: Error) =>
  error.message || "Failed to load submission status.";

const onTabRowWheel = (event: WheelEvent<HTMLDivElement>) => {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  const el = event.currentTarget;
  if (el.scrollWidth <= el.clientWidth) return;
  el.scrollLeft += event.deltaY;
  event.preventDefault();
};

const OutputBlock = ({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) => {
  if (!value) {
    return null;
  }

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm">
        {value}
      </pre>
    </div>
  );
};

type SubmissionStatusPanelProps = {
  /** ID of the submission to show live status for, or `null` if none has
   *  been started yet. Store-agnostic: callers own where this lives
   *  (redux, zustand, etc.) and pass it down. */
  submissionId: string | null;
  /** Whether a run/submit request is currently in flight but hasn't yet
   *  produced a submissionId (used only for the empty-state message). */
  isSubmitting: boolean;
};

export default function SubmissionStatusPanel({
  submissionId,
  isSubmitting: isSubmittingSubmission,
}: Readonly<SubmissionStatusPanelProps>) {
  const { data, error, isLoading } = useSubmissionStatus(submissionId);

  if (!submissionId) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-4 text-sm text-muted-foreground">
        {isSubmittingSubmission
          ? "Starting execution..."
          : "Run or submit your solution to see live execution status here."}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-4 text-sm text-destructive">
        {getQueryErrorMessage(error)}
      </div>
    );
  }

  let resultsContent = null;

  if (data?.results?.length) {
    resultsContent = (
      <Tabs
        key={submissionId}
        defaultValue="result-0"
        className="flex min-h-0 flex-1 flex-col"
        aria-label="Submission test results"
      >
        <div
          className="overflow-x-auto pb-1 [scrollbar-width:thin]"
          onWheel={onTabRowWheel}
        >
          <TabsList>
            {data.results.map((result, index) => {
              let statusIcon = null;

              if (result.status === "Accepted") {
                statusIcon = (
                  <Check size={14} className="mr-1 text-green-600" />
                );
              } else if (isFailedResultStatus(result.status)) {
                statusIcon = <X size={14} className="mr-1 text-destructive" />;
              }

              return (
                <TabsTrigger
                  key={`result-tab-${index}`}
                  value={`result-${index}`}
                  className="mr-2 shrink-0"
                >
                  {statusIcon}
                  Test {index + 1}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {data.results.map((result, index) => (
          <TabsContent
            key={`result-content-${index}`}
            value={`result-${index}`}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">
                  Test result {index + 1}
                </h4>
                <Badge
                  variant={getSubmissionStatusVariant(result.status)}
                  className={getSubmissionStatusClassName(result.status)}
                >
                  {result.status}
                </Badge>
              </div>

              {isPendingResultStatus(result.status) ? (
                <p className="text-sm text-muted-foreground">
                  This test case is still being processed.
                </p>
              ) : null}

              {result.runtime !== null || result.memoryUsed !== null ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Runtime
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {result.runtime !== null ? `${result.runtime} ms` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Memory
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {result.memoryUsed !== null
                        ? `${result.memoryUsed} KB`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ) : null}

              <OutputBlock title="Input" value={result.input} />
              <OutputBlock title="Actual Output" value={result.actualOutput} />
              <OutputBlock
                title="Expected Output"
                value={result.expectedOutput}
              />
              <OutputBlock
                title="Standard Output"
                value={result.standardOutput}
              />
              <OutputBlock
                title="Standard Error"
                value={result.standardError}
              />
              <OutputBlock
                title="Compile Output"
                value={result.compileOutput}
              />
            </section>
          </TabsContent>
        ))}
      </Tabs>
    );
  } else if (data && !isPendingSubmissionStatus(data.status)) {
    resultsContent = (
      <div className="text-sm text-muted-foreground">
        This submission completed without any test result details.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold">Latest submission</h3>
          {data ? (
            <Badge
              variant={getSubmissionStatusVariant(data.status)}
              className={getSubmissionStatusClassName(data.status)}
            >
              {data.status}
            </Badge>
          ) : null}
        </div>
        {isLoading && !data ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Loading submission status...
          </p>
        ) : null}
        {data && isPendingSubmissionStatus(data.status) ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Your submission is still being processed. Status updates will appear
            automatically.
          </p>
        ) : null}
      </section>

      {resultsContent}
    </div>
  );
}

"use client";

import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Check, X } from "lucide-react";
import { routerConfig } from "@/shared/router-config";
import type {
  AdminSubmissionDetail,
  AdminSubmissionResult,
} from "../models/admin-submission";
import type {
  SubmissionResultStatus,
  SubmissionStatus,
} from "../models/submission-status";

const failedStatuses = new Set<SubmissionStatus | SubmissionResultStatus>([
  "WrongAnswer",
  "TimeLimitExceeded",
  "MemoryLimitExceeded",
  "RuntimeError",
  "CompileError",
]);

function getStatusVariant(status: SubmissionStatus | SubmissionResultStatus) {
  return failedStatuses.has(status)
    ? ("destructive" as const)
    : ("secondary" as const);
}

function getStatusClassName(status: SubmissionStatus | SubmissionResultStatus) {
  return status === "Accepted"
    ? "bg-green-600 text-white hover:bg-green-600/90"
    : undefined;
}

function OutputBlock({
  title,
  value,
}: Readonly<{ title: string; value: string | null }>) {
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
}

function ResultsTabs({
  results,
}: Readonly<{ results: AdminSubmissionResult[] }>) {
  if (results.length === 0) {
    return null;
  }

  return (
    <Tabs defaultValue="result-0" aria-label="Submission test results">
      <div className="overflow-x-auto pb-1">
        <TabsList>
          {results.map((result, index) => {
            let statusIcon = null;

            if (result.status === "Accepted") {
              statusIcon = <Check size={14} className="mr-1 text-green-600" />;
            } else if (failedStatuses.has(result.status)) {
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

      {results.map((result, index) => (
        <TabsContent key={`result-content-${index}`} value={`result-${index}`}>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold">Test result {index + 1}</h4>
              <Badge
                variant={getStatusVariant(result.status)}
                className={getStatusClassName(result.status)}
              >
                {result.status}
              </Badge>
            </div>

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

            <OutputBlock title="Actual Output" value={result.actualOutput} />
            <OutputBlock
              title="Standard Output"
              value={result.standardOutput}
            />
            <OutputBlock title="Standard Error" value={result.standardError} />
            <OutputBlock title="Compile Output" value={result.compileOutput} />
          </section>
        </TabsContent>
      ))}
    </Tabs>
  );
}

type AdminSubmissionSummaryPanelProps = {
  submission: AdminSubmissionDetail;
};

export default function AdminSubmissionSummaryPanel({
  submission,
}: Readonly<AdminSubmissionSummaryPanelProps>) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 className="font-mono text-sm text-muted-foreground">
            {submission.id}
          </h2>
          <Link
            href={routerConfig.problem.execute({
              slug: submission.problemSlug,
            })}
            className="text-lg font-semibold hover:underline"
          >
            {submission.problemTitle}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{submission.type}</Badge>
          <Badge
            variant={getStatusVariant(submission.status)}
            className={getStatusClassName(submission.status)}
          >
            {submission.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            User
          </p>
          <p className="mt-1 text-sm">{submission.user.username}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Language
          </p>
          <p className="mt-1 text-sm">
            {submission.language.name} {submission.language.version}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Submitted
          </p>
          <p className="mt-1 text-sm">
            {new Date(submission.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Runtime / Memory
          </p>
          <p className="mt-1 text-sm">
            {submission.executionTime !== null
              ? `${submission.executionTime} ms`
              : "N/A"}{" "}
            /{" "}
            {submission.memoryUsage !== null
              ? `${submission.memoryUsage} KB`
              : "N/A"}
          </p>
        </div>
      </div>

      <OutputBlock title="Source Code" value={submission.sourceCode} />

      <ResultsTabs results={submission.results} />
    </div>
  );
}

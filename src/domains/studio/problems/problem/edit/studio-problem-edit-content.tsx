"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { routerConfig } from "@/shared/router-config";
import DifficultyBadge from "@/domains/problem/components/difficulty-badge";
import { useSuspenseStudioProblemDetails } from "@/domains/studio/api/get-studio-problem";
import { StudioProblemEditProvider } from "./studio-problem-edit-store-context";
import { StudioProblemSetupsProvider } from "./setups/studio-problem-setups-store-context";
import StudioProblemEditTabs from "./studio-problem-edit-tabs";
import StudioProblemEditStatusBanner from "./studio-problem-edit-status-banner";

type StudioProblemEditContentProps = {
  problemId: string;
};

function PendingValidationNotice({
  attemptCount,
}: Readonly<{ attemptCount: number }>) {
  return (
    <Card>
      <CardContent className="space-y-1 py-6">
        <p className="text-sm font-medium">
          Editing is locked while validation runs.
        </p>
        <p className="text-sm text-muted-foreground">
          {attemptCount > 0
            ? `Attempt ${attemptCount} is in progress. `
            : "A validation run is in progress. "}
          Cancel the run, or wait for it to finish, to make changes.
        </p>
      </CardContent>
    </Card>
  );
}

export default function StudioProblemEditContent({
  problemId,
}: Readonly<StudioProblemEditContentProps>) {
  const { data: details } = useSuspenseStudioProblemDetails({
    problemId,
    queryConfig: {
      refetchInterval: (query) =>
        query.state.data?.status === "Pending" ||
        query.state.data?.publishReadiness?.isRevalidating
          ? 3_000
          : false,
    },
  });

  const header = (
    <Card>
      <CardContent className="flex flex-wrap items-start justify-between gap-3 py-5">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-sm text-muted-foreground">
            {details.slug}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold">Editing: {details.title}</h1>
            <DifficultyBadge difficulty={details.difficultyTier} />
            <Badge variant="outline">{details.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Each section saves on its own. Nothing is published until you submit
            for validation.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link
            href={routerConfig.studioProblemDetail.execute({ id: problemId })}
          >
            <ArrowLeft className="mr-1 size-4" />
            Back to problem
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  if (
    details.status === "Pending" ||
    details.publishReadiness?.isRevalidating
  ) {
    return (
      <>
        {header}
        <PendingValidationNotice
          attemptCount={details.publishReadiness?.attemptCount ?? 0}
        />
      </>
    );
  }

  return (
    <>
      {header}
      <StudioProblemEditStatusBanner details={details} />

      <StudioProblemEditProvider key={details.problemId} details={details}>
        <StudioProblemSetupsProvider>
          <StudioProblemEditTabs details={details} />
        </StudioProblemSetupsProvider>
      </StudioProblemEditProvider>
    </>
  );
}

"use client";

import { Suspense } from "react";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AuthGuard } from "@/shared/guards/auth-guard";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import { routerConfig } from "@/shared/router-config";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { Permissions } from "@/shared/lib/permissions";
import StudioProblemNewMetadata from "./studio-problem-new-metadata";
import { useSuspenseInitialStudioProblemSetup } from "@/domains/studio/api/get-initial-studio-problem-setup";

function StudioProblemNewSkeleton() {
  return (
    <Card aria-label="Loading new problem form">
      <CardContent className="space-y-4 py-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </CardContent>
    </Card>
  );
}

function renderFallback(props: FallbackProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          {props.error instanceof Error
            ? props.error.message
            : "Couldn't load this problem."}
        </p>
        <Button onClick={props.resetErrorBoundary}>Try again</Button>
      </CardContent>
    </Card>
  );
}

function StudioProblemNewContent() {
  const { data: initialStudioProblemSetup } =
    useSuspenseInitialStudioProblemSetup();

  return (
    <StudioProblemNewMetadata
      initialStudioProblemSetup={initialStudioProblemSetup}
    />
  );
}

export default function StudioProblemNewLayout() {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_PROBLEMS_CREATE}
      fallback={
        <NotFoundCard
          title="Page not found"
          description="We could not find the page you are looking for. It may have been removed, renamed, or the link is incorrect."
        />
      }
    >
      <SidebarLayout
        breadcrumbs={[
          { name: "Studio", url: routerConfig.studioProblems.path },
          { name: "Problems", url: routerConfig.studioProblems.path },
          { name: "New" },
        ]}
      >
        <div className="px-2 md:px-4 pb-2 md:pb-4 flex flex-col gap-4">
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary onReset={reset} fallbackRender={renderFallback}>
                <Suspense fallback={<StudioProblemNewSkeleton />}>
                  <StudioProblemNewContent />
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}

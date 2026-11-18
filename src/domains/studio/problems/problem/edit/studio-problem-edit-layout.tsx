"use client";

import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AuthGuard } from "@/shared/guards/auth-guard";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import { routerConfig } from "@/shared/router-config";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { Permissions } from "@/shared/lib/permissions";
import StudioProblemEditContent from "./studio-problem-edit-content";

type StudioProblemEditLayoutProps = {
  id: string;
};

function StudioProblemEditSkeleton() {
  return (
    <div className="@container space-y-4" aria-label="Loading problem editor">
      <Card>
        <CardContent className="space-y-3 py-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4 @md:flex-row">
        <Skeleton className="h-20 flex-1" />
        <Skeleton className="h-20 flex-1" />
        <Skeleton className="h-20 flex-1" />
      </div>
    </div>
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

export default function StudioProblemEditLayout({
  id,
}: Readonly<StudioProblemEditLayoutProps>) {
  return (
    <AuthGuard
      permission={Permissions.STUDIO_PROBLEMS_UPDATE}
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
          {
            name: "Problem",
            url: routerConfig.studioProblemDetail.execute({ id }),
          },
          { name: "Edit" },
        ]}
      >
        <div className="px-2 md:px-4 pb-2 md:pb-4 flex flex-col gap-4">
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary onReset={reset} fallbackRender={renderFallback}>
                <Suspense fallback={<StudioProblemEditSkeleton />}>
                  <StudioProblemEditContent problemId={id} />
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}

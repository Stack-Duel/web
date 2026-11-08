"use client";

import { Suspense } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AuthGuard } from "@/shared/guards/auth-guard";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import { Permissions } from "@/shared/lib/permissions";
import { routerConfig } from "@/shared/router-config";
import StudioProblemContent from "./studio-problem-content";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import StudioProblemQuestion from "./studio-problem-question";
import StudioProblemSetups from "./studio-problem-setups/studio-problem-setups";

function StudioProblemSkeleton() {
  return (
    <div className="@container space-y-4" aria-label="Loading problem">
      <Card>
        <CardContent className="space-y-3 py-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-80" />
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

type StudioProblemLayoutProps = {
  id: string;
};

export default function StudioProblemLayout({
  id,
}: Readonly<StudioProblemLayoutProps>) {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_PROBLEMS_READ}
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
          { name: id },
        ]}
      >
        <div className="px-2 md:px-4 pb-2 md:pb-4 flex flex-col gap-4">
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary onReset={reset} fallbackRender={renderFallback}>
                <Suspense fallback={<StudioProblemSkeleton />}>
                  <StudioProblemContent id={id} />
                  <Card className="min-w-0">
                    <CardContent className="min-w-0">
                      <Tabs defaultValue="question">
                        <TabsList className="w-fit max-w-full overflow-x-auto">
                          <TabsTrigger value="question" className="flex-none">
                            Question
                          </TabsTrigger>
                          <TabsTrigger value="setups" className="flex-none">
                            Setups
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="question">
                          <StudioProblemQuestion problemId={id} />
                        </TabsContent>
                        <TabsContent value="setups">
                          <StudioProblemSetups problemId={id} />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}

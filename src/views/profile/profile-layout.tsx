"use client";

import { Suspense } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import ProfileContent from "./profile-content";

function ProfileSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading profile">
      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
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
            : "Couldn't load this profile."}
        </p>
        <Button onClick={props.resetErrorBoundary}>Try again</Button>
      </CardContent>
    </Card>
  );
}

type ProfileLayoutProps = {
  username: string;
};

export default function ProfileLayout({
  username,
}: Readonly<ProfileLayoutProps>) {
  return (
    <SidebarLayout breadcrumbs={[{ name: username }]}>
      <div className="px-2 md:px-4 pb-2 md:pb-4">
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary onReset={reset} fallbackRender={renderFallback}>
              <Suspense fallback={<ProfileSkeleton />}>
                <ProfileContent username={username} />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </div>
    </SidebarLayout>
  );
}

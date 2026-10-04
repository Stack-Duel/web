"use client";

import UserSetupForm from "@/domains/user/forms/user-setup-form";
import SetupFormSkeleton from "@/domains/user/components/setup-form-skeleton";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import Layout from "@/shared/layouts/layout/layout";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

function renderFallback(props: FallbackProps) {
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">
        {props.error instanceof Error
          ? props.error.message
          : "Couldn't load your account."}
      </p>
      <Button onClick={props.resetErrorBoundary}>Try again</Button>
    </div>
  );
}

export default function UserSetupLayout() {
  return (
    <Layout mainClassName="flex justify-center items-center pt-32 pb-9 px-2">
      <Card className="max-w-xl w-full">
        <CardContent>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary onReset={reset} fallbackRender={renderFallback}>
                <Suspense fallback={<SetupFormSkeleton />}>
                  <UserSetupForm />
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </CardContent>
      </Card>
    </Layout>
  );
}

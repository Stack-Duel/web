"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Separator } from "@/shared/components/ui/separator";
import { FallbackProps } from "react-error-boundary";

type NormalizedError = {
  message: string;
  stack?: string;
};

const normalizeError = (error: unknown): NormalizedError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown error",
  };
};

export function MainErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const isDev = process.env.NODE_ENV === "development";
  const normalizedError = normalizeError(error);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Something went wrong
          </CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try refreshing the page
            or contact support if the problem persists.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isDev && (
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertDescription className="font-mono text-sm break-all">
                <strong>Error:</strong> {normalizedError.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={resetErrorBoundary}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            <Button
              onClick={handleReload}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>

            <Button
              onClick={handleGoHome}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>

        {isDev && normalizedError.stack && (
          <>
            <Separator />
            <CardFooter className="pt-6">
              <div className="w-full">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Show Error Details
                  </summary>
                  <div className="mt-3 p-4 bg-muted rounded-md">
                    <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40 text-muted-foreground">
                      {normalizedError.stack}
                    </pre>
                  </div>
                </details>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

export function MinimalErrorFallback({
  resetErrorBoundary,
}: Pick<FallbackProps, "resetErrorBoundary">) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">An unexpected error occurred</p>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </div>
    </div>
  );
}

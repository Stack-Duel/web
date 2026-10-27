"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routerConfig } from "@/shared/router-config";

type StudioProblemsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function StudioProblemsError({
  error,
  reset,
}: Readonly<StudioProblemsErrorProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="px-2 pb-2 md:px-4 md:pb-4">
      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-muted">
              <AlertTriangle className="size-5 text-muted-foreground" />
            </div>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              We ran into a problem loading this page. Try again, or come back
              later.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              If this keeps happening, contact an admin.
            </p>
          </CardContent>

          <CardFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => reset()}>
              Try again
            </Button>
            <Button asChild>
              <Link href={routerConfig.studioProblems.path}>My problems</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

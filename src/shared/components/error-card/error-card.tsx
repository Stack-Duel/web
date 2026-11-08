"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";

type ErrorCardProps = {
  onRetry: () => void;
  homeHref: string;
  homeLabel: string;
};

export default function ErrorCard({
  onRetry,
  homeHref,
  homeLabel,
}: Readonly<ErrorCardProps>) {
  return (
    <div className="h-full px-2 pb-2 md:px-4 md:pb-4">
      <main className="mx-auto flex h-full w-full max-w-3xl items-center justify-center p-4">
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
            <Button type="button" variant="outline" onClick={onRetry}>
              Try again
            </Button>
            <Button asChild>
              <Link href={homeHref}>{homeLabel}</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

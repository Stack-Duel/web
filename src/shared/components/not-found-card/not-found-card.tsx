"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import { routerConfig } from "@/shared/router-config";

type NotFoundCardProps = {
  title: string;
  description: string;
  /** Set to false when rendered under a route segment that already
   *  provides a SidebarLayout, so the chrome isn't nested twice. */
  withLayout?: boolean;
};

export default function NotFoundCard({
  title,
  description,
  withLayout = true,
}: Readonly<NotFoundCardProps>) {
  const router = useRouter();

  const content = (
    <div className="h-full px-2 md:px-4 pb-2 md:pb-4">
      <main className="mx-auto flex h-full w-full max-w-3xl items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="size-5 text-muted-foreground" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Try going back to where you came from, or return home.
            </p>
          </CardContent>

          <CardFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Go back
            </Button>
            <Button asChild>
              <Link href={routerConfig.home.path}>Go home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );

  if (!withLayout) {
    return content;
  }

  return <SidebarLayout breadcrumbs={[]}>{content}</SidebarLayout>;
}

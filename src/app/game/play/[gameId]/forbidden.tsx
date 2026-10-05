"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import { routerConfig } from "@/shared/router-config";

export default function Forbidden() {
  const router = useRouter();

  return (
    <SidebarLayout breadcrumbs={[]}>
      <div className="px-2 pb-2 md:px-4 md:pb-4">
        <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-muted">
                <ShieldX className="size-5 text-muted-foreground" />
              </div>
              <CardTitle>Access denied</CardTitle>
              <CardDescription>
                You do not have permission to join or view this game.
              </CardDescription>
            </CardHeader>

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
    </SidebarLayout>
  );
}

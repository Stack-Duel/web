"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { LogOut } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { routerConfig } from "@/shared/router-config";
import { selectAvatarUrl, useUserStore } from "@/domains/user/state/user-store";

export default function AccountTab() {
  const { user, isLoading } = useUser();
  const avatarUrl = useUserStore(selectAvatarUrl);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          This information comes from your login provider and can&apos;t be
          edited here.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Avatar size="lg" className="size-12">
          <AvatarImage src={avatarUrl ?? undefined} alt={user?.name} />
          <AvatarFallback>
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium">{user?.name ?? "Unknown"}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline">
          <a href={routerConfig.authLogOut.path}>
            <LogOut />
            Log out
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

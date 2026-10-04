"use client";

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
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { routerConfig } from "@/shared/router-config";
import { useTenant } from "@/domains/tenant/state/tenant-store";
import { SignInButton, SignOutButton, SignUpButton, useUser } from "@clerk/nextjs";
import { ChevronsUpDown, LogOut, Settings2 } from "lucide-react";
import Link from "next/link";

export default function SidebarUser() {
  const { user, isLoaded } = useUser();
  const tenant = useTenant();
  const { isMobile } = useSidebar();

  if (!isLoaded) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="h-8 w-8 " />
            <div className="grid flex-1 gap-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) {
    return (
      <Card className="rounded">
        <CardHeader>
          <CardTitle>Join the {tenant.name} community</CardTitle>
          <CardDescription>
            Sign up to track progress and solve problems.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild variant="outline" className="grow">
            <SignInButton mode="modal" />
          </Button>
          <Button asChild variant="default" className="grow">
            <SignUpButton mode="modal" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const displayName = user.fullName ?? user.username ?? "User";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild data-cy="user-dropdown-trigger">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 ">
                <AvatarImage src={user.imageUrl} alt={displayName} />
                <AvatarFallback>{displayName[0] ?? "U"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 "
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 ">
                  <AvatarImage src={user.imageUrl} alt={displayName} />
                  <AvatarFallback>{displayName[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={routerConfig.profileSettings.path}>
                  <Settings2 />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button
                asChild
                variant="ghost"
                className="flex justify-start items-center"
              >
                <SignOutButton>
                  <span className="flex items-center gap-2">
                    <LogOut />
                    Log Out
                  </span>
                </SignOutButton>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

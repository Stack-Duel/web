"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { routerConfig } from "@/shared/router-config";
import { SidebarMainNav } from "./sidebar-main-nav";
import SidebarUser from "./sidebar-user";
import ActiveGamesSidebarCard from "@/domains/game/components/active-games-sidebar-card";
import Link from "next/link";
import { useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import {
  selectUserPermissions,
  useUserStore,
} from "@/domains/user/state/user-store";
import { useFeatureFlag } from "@/domains/feature-flags/hooks/use-feature-flag";
import { FeatureFlags } from "@/domains/feature-flags/lib/well-known-features";
import Logo from "@/shared/logo/logo";
import { buildNavItems } from "./nav-items";
import { filterNavByAccess } from "./filter-nav";

export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const { user } = useUser();
  const userPermissions = useUserStore(selectUserPermissions);
  const permissions = useMemo(
    () => new Set(userPermissions),
    [userPermissions]
  );

  const leaderboardsEnabled = useFeatureFlag(FeatureFlags.LEADERBOARDS);
  const flags = useMemo(
    () => ({ [FeatureFlags.LEADERBOARDS]: leaderboardsEnabled }),
    [leaderboardsEnabled]
  );

  const navItems = useMemo(
    () => filterNavByAccess(buildNavItems(!!user), { permissions, flags }),
    [user, permissions, flags]
  );

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={routerConfig.dashboard.path}>
                <Logo className="h-8" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMainNav items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <ActiveGamesSidebarCard />
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}

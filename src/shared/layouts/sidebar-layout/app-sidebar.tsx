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
import {
  HomeIcon,
  MessageCircle,
  Puzzle,
  ShieldCheck,
  Swords,
  Trophy,
} from "lucide-react";
import { SidebarMainNav } from "./sidebar-main-nav";
import SidebarUser from "./sidebar-user";
import ActiveGamesSidebarCard from "@/domains/game/components/active-games-sidebar-card";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";
import { GameModeKey } from "@/domains/game/models/game-mode";
import {
  selectUserPermissions,
  useUserStore,
} from "@/domains/user/state/user-store";
import { Permissions } from "@/shared/lib/permissions";
import { useFeatureFlag } from "@/domains/feature-flags/hooks/use-feature-flag";
import { FeatureFlags } from "@/domains/feature-flags/lib/well-known-features";
import { socialLinks } from "@/shared/lib/social-links";
import Logo from "@/shared/logo/logo";

export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const { user } = useUser();
  const permissions = useUserStore(selectUserPermissions);
  const leaderboardsEnabled = useFeatureFlag(FeatureFlags.LEADERBOARDS);
  const canReadAdminUsers = permissions.includes(Permissions.ADMIN_USERS_READ);
  const canReadAdminSubmissions = permissions.includes(
    Permissions.ADMIN_SUBMISSIONS_READ
  );
  const canReadAdminProblems = permissions.includes(
    Permissions.ADMIN_PROBLEMS_READ
  );
  const canReadAdminFeedback = permissions.includes(
    Permissions.ADMIN_FEEDBACK_READ
  );
  const canReadAdminDashboard = permissions.includes(
    Permissions.ADMIN_DASHBOARD_READ
  );
  const canReadAdminGames = permissions.includes(Permissions.ADMIN_GAMES_READ);
  const canManageFeatureFlags = permissions.includes(
    Permissions.ADMIN_FEATURE_FLAGS_MANAGE
  );
  const canManageRequiredProblemLanguages = permissions.includes(
    Permissions.ADMIN_REQUIRED_LANGUAGES_MANAGE
  );
  const canReadAdminAuditLog = permissions.includes(
    Permissions.ADMIN_AUDIT_LOG_READ
  );

  const data = {
    navMain: [
      {
        title: user ? "Dashboard" : "Home",
        url: user ? routerConfig.dashboard.path : routerConfig.home.path,
        icon: HomeIcon,
        isActive: true,
      },
      {
        title: "Problems",
        url: routerConfig.problems.path,
        icon: Puzzle,
      },
      {
        title: "Games",
        url: routerConfig.games.execute(),
        icon: Swords,
        isActive: true,
        items: [
          {
            title: "Solo Rush",
            url: routerConfig.games.execute(),
          },
          {
            title: "Duel",
            url: routerConfig.games.execute({ mode: GameModeKey.Duel }),
          },
          {
            title: "Free For All",
            url: routerConfig.games.execute({ mode: GameModeKey.Ffa }),
          },
        ],
      },
      ...(leaderboardsEnabled
        ? [
            {
              title: "Leaderboards",
              url: routerConfig.leaderboards.execute(),
              icon: Trophy,
            },
          ]
        : []),
      {
        title: "Community",
        icon: MessageCircle,
        items: socialLinks.map((link) => ({
          title: link.name,
          url: link.href,
          icon: link.icon,
          external: true,
        })),
      },
      ...(canReadAdminDashboard ||
      canReadAdminUsers ||
      canReadAdminSubmissions ||
      canReadAdminProblems ||
      canReadAdminFeedback ||
      canReadAdminGames ||
      canManageFeatureFlags ||
      canManageRequiredProblemLanguages ||
      canReadAdminAuditLog
        ? [
            {
              title: "Admin",
              url: routerConfig.admin.path,
              icon: ShieldCheck,
              items: [
                ...(canReadAdminDashboard
                  ? [{ title: "Dashboard", url: routerConfig.admin.path }]
                  : []),
                ...(canReadAdminUsers
                  ? [{ title: "Users", url: routerConfig.adminUsers.path }]
                  : []),
                ...(canReadAdminProblems
                  ? [
                      {
                        title: "Problems",
                        url: routerConfig.adminProblems.path,
                      },
                    ]
                  : []),
                ...(canReadAdminGames
                  ? [{ title: "Games", url: routerConfig.adminGames.path }]
                  : []),
                ...(canReadAdminSubmissions
                  ? [
                      {
                        title: "Submissions",
                        url: routerConfig.adminSubmissions.path,
                      },
                    ]
                  : []),
                ...(canReadAdminFeedback
                  ? [
                      {
                        title: "Feedback",
                        url: routerConfig.adminFeedback.path,
                      },
                    ]
                  : []),
                ...(canManageFeatureFlags
                  ? [
                      {
                        title: "Feature Flags",
                        url: routerConfig.adminFeatureFlags.path,
                      },
                    ]
                  : []),
                ...(canManageRequiredProblemLanguages
                  ? [
                      {
                        title: "Required Languages",
                        url: routerConfig.adminRequiredProblemLanguages.path,
                      },
                    ]
                  : []),
                ...(canReadAdminAuditLog
                  ? [
                      {
                        title: "Audit Log",
                        url: routerConfig.adminAuditLog.path,
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
    ],
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={routerConfig.dashboard.path}>
                <Logo className="h-9" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMainNav items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <ActiveGamesSidebarCard />
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}

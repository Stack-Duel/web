import {
  HomeIcon,
  MessageCircle,
  PencilRuler,
  Puzzle,
  ShieldCheck,
  Swords,
  Trophy,
} from "lucide-react";
import { routerConfig } from "@/shared/router-config";
import { GameModeKey } from "@/domains/game/models/game-mode";
import { Permissions } from "@/shared/lib/permissions";
import { FeatureFlags } from "@/domains/feature-flags/lib/well-known-features";
import { socialLinks } from "@/shared/lib/social-links";
import type { NavLink } from "./nav-link";

export function buildNavItems(isAuthenticated: boolean): NavLink[] {
  return [
    {
      title: isAuthenticated ? "Dashboard" : "Home",
      url: isAuthenticated
        ? routerConfig.dashboard.path
        : routerConfig.home.path,
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
        { title: "Solo Rush", url: routerConfig.games.execute() },
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
    {
      title: "Leaderboards",
      url: routerConfig.leaderboards.execute(),
      icon: Trophy,
      featureFlag: FeatureFlags.LEADERBOARDS,
    },
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
    {
      title: "Studio",
      icon: PencilRuler,
      permission: Permissions.ADMIN_PROBLEMS_READ,
      items: [{ title: "Problems", url: routerConfig.studioProblems.path }],
    },
    {
      title: "Admin",
      url: routerConfig.admin.path,
      icon: ShieldCheck,
      permission: [
        Permissions.ADMIN_DASHBOARD_READ,
        Permissions.ADMIN_USERS_READ,
        Permissions.ADMIN_PROBLEMS_READ,
        Permissions.ADMIN_SUBMISSIONS_READ,
        Permissions.ADMIN_FEEDBACK_READ,
        Permissions.ADMIN_GAMES_READ,
        Permissions.ADMIN_FEATURE_FLAGS_MANAGE,
        Permissions.ADMIN_REQUIRED_LANGUAGES_MANAGE,
        Permissions.ADMIN_AUDIT_LOG_READ,
      ],
      items: [
        {
          title: "Dashboard",
          url: routerConfig.admin.path,
          permission: Permissions.ADMIN_DASHBOARD_READ,
        },
        {
          title: "Users",
          url: routerConfig.adminUsers.path,
          permission: Permissions.ADMIN_USERS_READ,
        },
        {
          title: "Problems",
          url: routerConfig.adminProblems.path,
          permission: Permissions.ADMIN_PROBLEMS_READ,
        },
        {
          title: "Games",
          url: routerConfig.adminGames.path,
          permission: Permissions.ADMIN_GAMES_READ,
        },
        {
          title: "Submissions",
          url: routerConfig.adminSubmissions.path,
          permission: Permissions.ADMIN_SUBMISSIONS_READ,
        },
        {
          title: "Feedback",
          url: routerConfig.adminFeedback.path,
          permission: Permissions.ADMIN_FEEDBACK_READ,
        },
        {
          title: "Feature Flags",
          url: routerConfig.adminFeatureFlags.path,
          permission: Permissions.ADMIN_FEATURE_FLAGS_MANAGE,
        },
        {
          title: "Required Languages",
          url: routerConfig.adminRequiredProblemLanguages.path,
          permission: Permissions.ADMIN_REQUIRED_LANGUAGES_MANAGE,
        },
        {
          title: "Audit Log",
          url: routerConfig.adminAuditLog.path,
          permission: Permissions.ADMIN_AUDIT_LOG_READ,
        },
      ],
    },
  ];
}

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
import { HomeIcon, MessageCircle, Puzzle, Swords } from "lucide-react";
import { SidebarMainNav } from "./sidebar-main-nav";
import SidebarUser from "./sidebar-user";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { socialLinks } from "@/shared/lib/social-links";
import Logo from "@/shared/logo/logo";

export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const { isSignedIn } = useUser();

  const data = {
    navMain: [
      {
        title: isSignedIn ? "Dashboard" : "Home",
        url: isSignedIn ? routerConfig.dashboard.path : routerConfig.home.path,
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
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MonitorCog, Settings2, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { routerConfig } from "@/shared/router-config";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

const navItems = [
  { name: "Profile", href: routerConfig.settingsProfile.path, icon: User },
  { name: "Account", href: routerConfig.settingsAccount.path, icon: Settings2 },
  {
    name: "Preferences",
    href: routerConfig.settingsPreferences.path,
    icon: MonitorCog,
  },
] as const;

export default function SettingsNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <Tabs
        value={pathname}
        onValueChange={(value) => router.push(value)}
        className="@3xl:hidden overflow-x-auto"
      >
        <TabsList className="w-full">
          {navItems.map(({ name, href, icon: Icon }) => (
            <TabsTrigger key={href} value={href} aria-label={name}>
              <Icon />
              <span className="hidden @sm:inline">{name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <nav className="hidden @3xl:flex flex-col gap-1">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {name}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

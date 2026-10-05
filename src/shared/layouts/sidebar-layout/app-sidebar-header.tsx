import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { ModeToggle } from "@/shared/theme/mode-toggle";
import SocialLinkButton from "@/shared/components/social-link-button";
import { discordLink } from "@/shared/lib/social-links";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import React from "react";

export type BreadcrumbItem = {
  name: string;
  url?: string;
};

interface AppSidebarHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  headerItems?: React.ReactNode;
  headerClassName?: string;
}

export default function AppSidebarHeader({
  breadcrumbs = [],
  headerItems = (
    <div className="ml-auto mr-3 flex items-center gap-2">
      <SocialLinkButton
        href={discordLink.href}
        icon={discordLink.icon}
        label="Join our Discord"
      />
      <ModeToggle />
    </div>
  ),
  headerClassName,
}: Readonly<AppSidebarHeaderProps>) {
  return (
    <header
      className={cn(
        "flex min-h-16 shrink-0 items-center gap-2 py-2 px-2 md:px-4",
        headerClassName
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
        />
        {breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <React.Fragment key={index}>
                    <BreadcrumbItem
                      className={index === 0 ? "hidden md:block" : ""}
                    >
                      {isLast || !breadcrumb.url ? (
                        <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={breadcrumb.url}>{breadcrumb.name}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator
                        className={index === 0 ? "hidden md:block" : ""}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      {headerItems}
    </header>
  );
}

import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import React, { ReactNode } from "react";
import AppSidebar from "./app-sidebar";
import AppSidebarHeader, { BreadcrumbItem } from "./app-sidebar-header";
import { cn } from "@/shared/lib/utils";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

type SidebarProps = {
  breadcrumbs: BreadcrumbItem[];
  children?: ReactNode;
  defaultOpen?: boolean;
  headerItems?: React.ReactNode;
  headerClassName?: string;
  className?: string;
};

export default function SidebarLayout({
  breadcrumbs,
  children,
  defaultOpen,
  headerItems,
  headerClassName,
  className,
}: Readonly<SidebarProps>) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <AppSidebarHeader
            breadcrumbs={breadcrumbs}
            headerItems={headerItems}
            headerClassName={headerClassName}
          />
          <div
            id="sidebar-layout-content"
            className={cn("flex-1 min-h-0 overflow-y-auto", className)}
          >
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

import type { ReactNode } from "react";
import { AuthGuard } from "@/shared/guards/auth-guard";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import { Permissions } from "@/shared/lib/permissions";

export default function StudioProblemsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_PROBLEMS_READ}
      fallback={
        <NotFoundCard
          title="Page not found"
          description="We could not find the page you are looking for. It may have been removed, renamed, or the link is incorrect."
        />
      }
    >
      <SidebarLayout breadcrumbs={[{ name: "Studio" }, { name: "Problems" }]}>
        {children}
      </SidebarLayout>
    </AuthGuard>
  );
}

"use client";

import AdminFeatureFlagsTable from "@/domains/feature-flags/tables/admin-feature-flags-table";
import CreateFeatureFlagDialog from "@/domains/feature-flags/components/create-feature-flag-dialog";
import { AuthGuard } from "@/shared/guards/auth-guard";
import { Permissions } from "@/shared/lib/permissions";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";

export default function AdminFeatureFlagsLayout() {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_FEATURE_FLAGS_MANAGE}
      fallback={
        <NotFoundCard
          title="Page not found"
          description="We could not find the page you are looking for. It may have been removed, renamed, or the link is incorrect."
        />
      }
    >
      <SidebarLayout
        breadcrumbs={[
          { name: "Admin", url: "/admin" },
          { name: "Feature Flags" },
        ]}
      >
        <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
          <Card className="col-span-12">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Feature Flags</CardTitle>
              <CreateFeatureFlagDialog />
            </CardHeader>
            <CardContent>
              <AdminFeatureFlagsTable />
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}

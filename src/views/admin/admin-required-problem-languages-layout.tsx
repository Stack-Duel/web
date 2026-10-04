"use client";

import RequiredProblemLanguagesTable from "@/domains/problem/tables/required-problem-languages-table";
import AddRequiredLanguageDialog from "@/domains/problem/components/add-required-language-dialog";
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

export default function AdminRequiredProblemLanguagesLayout() {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_REQUIRED_LANGUAGES_MANAGE}
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
          { name: "Required Languages" },
        ]}
      >
        <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
          <Card className="col-span-12">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Required Languages</CardTitle>
              <AddRequiredLanguageDialog />
            </CardHeader>
            <CardContent>
              <RequiredProblemLanguagesTable />
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}

"use client";

import CreateProblemForm from "@/domains/problem/forms/create-problem-form";
import UploadProblemInfoJsonButton from "@/domains/problem/components/upload-problem-info-json-button";
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

export default function AdminCreateProblemLayout() {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_PROBLEMS_CREATE}
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
          { name: "Problems", url: "/admin/problems" },
          { name: "New" },
        ]}
      >
        <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
          <Card className="col-span-12">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>New Problem</CardTitle>
              <UploadProblemInfoJsonButton />
            </CardHeader>
            <CardContent>
              <CreateProblemForm />
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}

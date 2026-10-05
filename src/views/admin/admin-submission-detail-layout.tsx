"use client";

import AdminSubmissionSummaryPanel from "@/domains/submission/components/admin-submission-summary-panel";
import AdminSubmissionPipelineView from "@/domains/submission/components/admin-submission-pipeline-view";
import { useAdminSubmissionDetail } from "@/domains/submission/api/get-admin-submission-detail";
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

type AdminSubmissionDetailLayoutProps = {
  id: string;
};

export default function AdminSubmissionDetailLayout({
  id,
}: Readonly<AdminSubmissionDetailLayoutProps>) {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_SUBMISSIONS_READ}
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
          { name: "Submissions", url: "/admin/submissions" },
          { name: id },
        ]}
      >
        <AdminSubmissionDetailContent id={id} />
      </SidebarLayout>
    </AuthGuard>
  );
}

function AdminSubmissionDetailContent({ id }: Readonly<{ id: string }>) {
  const { data, isLoading, error } = useAdminSubmissionDetail({ id });

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-4 text-sm text-destructive">Submission not found.</div>
    );
  }

  return (
    <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
      <Card className="col-span-12">
        <CardContent className="pt-6">
          <AdminSubmissionSummaryPanel submission={data} />
        </CardContent>
      </Card>
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Pipeline Run</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminSubmissionPipelineView job={data.job} />
        </CardContent>
      </Card>
    </div>
  );
}

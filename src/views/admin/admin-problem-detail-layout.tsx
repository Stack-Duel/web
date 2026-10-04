"use client";

import { Badge } from "@/shared/components/ui/badge";
import DifficultyBadge from "@/domains/problem/components/difficulty-badge";
import AdminProblemStatusBadge from "@/domains/problem/components/admin-problem-status-badge";
import AdminProblemSetupsList from "@/domains/problem/components/admin-problem-setups-list";
import AddProblemSetupLanguageDialog from "@/domains/problem/components/add-problem-setup-language-dialog";
import UploadSetupsJsonButton from "@/domains/problem/components/upload-setups-json-button";
import UploadSampleTestCasesJsonButton from "@/domains/problem/components/upload-sample-test-cases-json-button";
import UploadGenerationParametersJsonButton from "@/domains/problem/components/upload-generation-parameters-json-button";
import AdminProblemPools from "@/domains/problem/components/admin-problem-pools";
import AdminProblemPendingBanner from "@/domains/problem/components/admin-problem-pending-banner";
import AdminProblemValidationFailureAlert from "@/domains/problem/components/admin-problem-validation-failure-alert";
import SubmitForValidationButton from "@/domains/problem/components/submit-for-validation-button";
import SampleTestCaseEditor from "@/domains/problem/components/sample-test-case-editor";
import GenerationParametersEditor from "@/domains/problem/components/generation-parameters-editor";
import EditProblemForm from "@/domains/problem/forms/edit-problem-form";
import { useAdminProblemDetail } from "@/domains/problem/api/get-admin-problem-detail";
import { AuthGuard } from "@/shared/guards/auth-guard";
import { Permissions } from "@/shared/lib/permissions";
import { AdminRestrictedFallback } from "./admin-restricted-fallback";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import type { AdminProblemDetail } from "@/domains/problem/models/admin-problem";

type AdminProblemDetailLayoutProps = {
  id: string;
};

export default function AdminProblemDetailLayout({
  id,
}: Readonly<AdminProblemDetailLayoutProps>) {
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
      <SidebarLayout
        breadcrumbs={[
          { name: "Admin", url: "/admin" },
          { name: "Problems", url: "/admin/problems" },
          { name: id },
        ]}
      >
        <AdminProblemDetailContent id={id} />
      </SidebarLayout>
    </AuthGuard>
  );
}

function AdminProblemDetailContent({ id }: Readonly<{ id: string }>) {
  const { data, isLoading, error } = useAdminProblemDetail({
    id,
    queryConfig: {
      refetchInterval: (query) =>
        query.state.data?.status === "Pending" ? 3_000 : false,
    },
  });

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-4 text-sm text-destructive">Problem not found.</div>
    );
  }

  const isPending = data.status === "Pending";
  const canSubmit = data.status === "Draft" || data.status === "Failed";

  return (
    <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
      <Card className="col-span-12">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="font-mono text-sm text-muted-foreground">
                {data.slug}
              </h2>
              <CardTitle className="text-lg">{data.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={data.difficultyTier} />
              <AdminProblemStatusBadge status={data.status} />
              {data.trackName && (
                <Badge variant="outline">{data.trackName}</Badge>
              )}
              {data.createdByUsername && (
                <Badge variant="outline">by {data.createdByUsername}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPending && <AdminProblemPendingBanner />}
          {data.status === "Failed" && (
            <AdminProblemValidationFailureAlert
              reason={data.validationFailureReason}
            />
          )}

          <AuthGuard
            permission={Permissions.ADMIN_PROBLEMS_UPDATE}
            fallback={<AdminRestrictedFallback />}
          >
            {isPending ? (
              <p className="text-sm text-muted-foreground">
                This problem can&apos;t be edited while validation is in
                progress.
              </p>
            ) : (
              <EditProblemForm key={data.id} problem={data} />
            )}
          </AuthGuard>

          {canSubmit && (
            <AuthGuard
              permission={Permissions.ADMIN_PROBLEMS_SUBMIT}
              fallback={null}
            >
              <div className="flex justify-end border-t pt-4">
                <SubmitForValidationButton problemId={data.id} />
              </div>
            </AuthGuard>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Setups</CardTitle>
          {!isPending && (
            <AuthGuard
              permission={Permissions.ADMIN_PROBLEMS_CREATE}
              fallback={null}
            >
              <div className="flex items-center gap-2">
                <UploadSetupsJsonButton problemId={data.id} />
                <AddProblemSetupLanguageDialog
                  problemId={data.id}
                  existingSetups={data.setups}
                />
              </div>
            </AuthGuard>
          )}
        </CardHeader>
        <CardContent>
          <AuthGuard
            permission={Permissions.ADMIN_PROBLEMS_CREATE}
            fallback={<AdminProblemSetupsList setups={data.setups} />}
          >
            <AdminProblemSetupsList
              setups={data.setups}
              problemId={isPending ? undefined : data.id}
            />
          </AuthGuard>
        </CardContent>
      </Card>

      {!isPending && (
        <AuthGuard
          permission={Permissions.ADMIN_PROBLEMS_CREATE}
          fallback={null}
        >
          <SampleTestCasesCard data={data} />
          <GenerationParametersCard data={data} />
        </AuthGuard>
      )}

      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Pools</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminProblemPools problemId={data.id} poolKeys={data.poolKeys} />
        </CardContent>
      </Card>
    </div>
  );
}

function SampleTestCasesCard({ data }: Readonly<{ data: AdminProblemDetail }>) {
  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Sample Test Cases</CardTitle>
        <UploadSampleTestCasesJsonButton problemId={data.id} />
      </CardHeader>
      <CardContent>
        <SampleTestCaseEditor
          key={data.id}
          problemId={data.id}
          initialTestCases={data.setups[0]?.sampleTestCases ?? []}
        />
      </CardContent>
    </Card>
  );
}

function GenerationParametersCard({
  data,
}: Readonly<{ data: AdminProblemDetail }>) {
  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Generation Parameters</CardTitle>
        <UploadGenerationParametersJsonButton problemId={data.id} />
      </CardHeader>
      <CardContent>
        <GenerationParametersEditor
          key={data.id}
          problemId={data.id}
          initialParameters={data.generationParameters}
          initialOutputValueType={data.generationOutputValueType}
          initialTargetCaseCount={data.generationTargetCaseCount}
          initialSeed={data.generationSeed}
        />
      </CardContent>
    </Card>
  );
}

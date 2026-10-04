"use client";
import { Problem } from "@/domains/problem/models/problem";
import ProblemSubmissionsFilter from "@/domains/problem/problem-submissions/components/problem-submissions-filter";
import ProblemSubmissionsHeader from "@/domains/problem/problem-submissions/components/problem-submissions-header";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import ProblemSubmissions from "@/domains/problem/problem-submissions/components/problem-submissions";
import { ProblemSubmissionsFilterProvider } from "@/domains/problem/problem-submissions/state/problem-submissions-filter-store-context";
import { Permissions } from "@/shared/lib/permissions";
import { AuthGuard } from "@/shared/guards/auth-guard";
import { Card, CardContent } from "@/shared/components/ui/card";
import { AuthGuardFallback } from "@/shared/guards/auth-guard-fallback";
import { routerConfig } from "@/shared/router-config";

type ProblemSubmissionsLayoutProps = {
  problem: Problem;
  isAuthenticated: boolean;
};

export default function ProblemSubmissionsLayout({
  problem,
  isAuthenticated,
}: Readonly<ProblemSubmissionsLayoutProps>) {
  return (
    <SidebarLayout
      breadcrumbs={[
        {
          name: problem.slug,
          url: routerConfig.problem.execute({ slug: problem.slug }),
        },
        {
          name: "Submissions",
          url: routerConfig.problemSubmissions.execute({ slug: problem.slug }),
        },
      ]}
    >
      <ProblemSubmissionsFilterProvider>
        <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
          <ProblemSubmissionsHeader
            problem={problem}
            className="col-span-12 order-1"
          />
          <div className="col-span-12 @3xl:col-span-8 order-3 @3xl:order-2">
            <AuthGuard
              permission={Permissions.SUBMISSION_VIEW}
              fallback={
                <Card>
                  <CardContent className="py-3">
                    <AuthGuardFallback
                      reason={isAuthenticated ? "forbidden" : "unauthenticated"}
                    />
                  </CardContent>
                </Card>
              }
            >
              <ProblemSubmissions
                problem={problem}
                isAuthenticated={isAuthenticated}
              />
            </AuthGuard>
          </div>
          <ProblemSubmissionsFilter
            slug={problem.slug}
            isAuthenticated={isAuthenticated}
            className="col-span-12 @3xl:col-span-4 order-2 @3xl:order-3  @3xl:sticky @3xl:top-0"
          />
        </div>
      </ProblemSubmissionsFilterProvider>
    </SidebarLayout>
  );
}

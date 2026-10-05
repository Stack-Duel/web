"use client";

import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { AuthGuard } from "@/shared/guards/auth-guard";
import { Permissions } from "@/shared/lib/permissions";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import { routerConfig } from "@/shared/router-config";
import { useProblemPools } from "@/domains/problem/api/get-problem-pools";
import CreateProblemPoolForm from "@/domains/problem/components/create-problem-pool-form";

export default function AdminProblemPoolsLayout() {
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
          { name: "Problems", url: routerConfig.adminProblems.path },
          { name: "Pools" },
        ]}
      >
        <AdminProblemPoolsContent />
      </SidebarLayout>
    </AuthGuard>
  );
}

function AdminProblemPoolsContent() {
  const { data: pools, isLoading } = useProblemPools();

  return (
    <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Problem pools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading pools...</p>
          ) : !pools || pools.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No problem pools exist yet. Create one below.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {pools.map((pool) => (
                <Link
                  key={pool.id}
                  href={routerConfig.adminProblemPoolDetail.execute({
                    key: pool.key,
                  })}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{pool.name}</span>
                    {pool.description ? (
                      <span className="text-xs text-muted-foreground">
                        {pool.description}
                      </span>
                    ) : null}
                  </div>
                  <Badge variant="outline">{pool.problemCount} problems</Badge>
                </Link>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <CreateProblemPoolForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
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
import { useProblemPoolMemberIds } from "@/domains/problem/api/get-problem-pool-member-ids";
import AdminPoolAddTable from "@/domains/problem/components/admin-pool-add-table";
import AdminPoolMembersTable from "@/domains/problem/components/admin-pool-members-table";
import AdminPoolOrderList from "@/domains/problem/components/admin-pool-order-list";

type AdminProblemPoolDetailLayoutProps = {
  poolKey: string;
};

export default function AdminProblemPoolDetailLayout({
  poolKey,
}: Readonly<AdminProblemPoolDetailLayoutProps>) {
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
          { name: "Pools", url: routerConfig.adminProblemPools.path },
          { name: poolKey },
        ]}
      >
        <AdminProblemPoolDetailContent poolKey={poolKey} />
      </SidebarLayout>
    </AuthGuard>
  );
}

function AdminProblemPoolDetailContent({
  poolKey,
}: Readonly<{ poolKey: string }>) {
  const { data: pools, isLoading: isLoadingPools } = useProblemPools();
  const { data: memberIdsData } = useProblemPoolMemberIds({ poolKey });
  const [membersRefreshToken, setMembersRefreshToken] = useState(0);

  const pool = pools?.find((p) => p.key === poolKey);
  const memberIds = useMemo(
    () => new Set(memberIdsData ?? []),
    [memberIdsData]
  );

  if (isLoadingPools) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  if (!pool) {
    return <div className="p-4 text-sm text-destructive">Pool not found.</div>;
  }

  return (
    <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>{pool.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {pool.description ? (
            <p className="text-sm text-muted-foreground">{pool.description}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Problems in this pool ({memberIds.size})</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminPoolMembersTable key={membersRefreshToken} poolKey={poolKey} />
        </CardContent>
      </Card>

      <div className="col-span-12">
        <AdminPoolOrderList key={membersRefreshToken} poolKey={poolKey} />
      </div>

      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Add problems</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminPoolAddTable
            poolKey={poolKey}
            memberIds={memberIds}
            onAdded={() => setMembersRefreshToken((token) => token + 1)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

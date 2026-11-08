"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import MyProblemsTable from "@/domains/problem/tables/my-problems-table";
import MyProblemSearchInput from "@/domains/problem/components/my-problem-search-input";
import MyProblemStatusTabs from "@/domains/problem/components/my-problem-status-tabs";
import MyProblemsStatCards from "@/domains/problem/components/my-problems-stat-cards";
import { useMyProblemsMetadata } from "@/domains/problem/api/get-my-problems-metadata";
import {
  getOpenProblemCount,
  MAX_OPEN_PROBLEMS_PER_CREATOR,
} from "@/domains/problem/lib/problem-limits";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import LimitBadge from "@/shared/components/limit-badge/limit-badge";
import { routerConfig } from "@/shared/router-config";
import { AuthGuard } from "@/shared/guards/auth-guard";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import { Permissions } from "@/shared/lib/permissions";

export default function StudioProblemsLayout() {
  const { data: metadata } = useMyProblemsMetadata();
  const openCount = getOpenProblemCount(metadata?.statusBreakdown ?? []);

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
        <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
          <Card className="col-span-12">
            <CardHeader className="flex flex-col items-stretch gap-2">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Your Problems</CardTitle>
                <div className="flex items-center gap-2">
                  <LimitBadge
                    current={openCount}
                    max={MAX_OPEN_PROBLEMS_PER_CREATOR}
                    label="open"
                    className="hidden @md:inline-flex"
                  />
                  <Button size="sm" className="gap-1.5" asChild>
                    <Link href={routerConfig.studioProblemNew.path}>
                      <Plus size={14} /> New Problem
                    </Link>
                  </Button>
                </div>
              </div>
              <LimitBadge
                current={openCount}
                max={MAX_OPEN_PROBLEMS_PER_CREATOR}
                label="open"
                className="@md:hidden"
              />
            </CardHeader>
          </Card>

          <MyProblemsStatCards />

          <Card className="col-span-12">
            <CardHeader className="flex flex-col items-stretch gap-3 @md:flex-row @md:items-center @md:justify-between">
              <MyProblemStatusTabs />
              <MyProblemSearchInput />
            </CardHeader>
            <CardContent>
              <MyProblemsTable />
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}

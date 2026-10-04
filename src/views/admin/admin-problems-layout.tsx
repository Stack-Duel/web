"use client";

import Link from "next/link";
import { CalendarDays, Layers, Plus } from "lucide-react";
import AdminProblemsTable from "@/domains/problem/tables/admin-problems-table";
import AdminProblemSearchInput from "@/domains/problem/components/admin-problem-search-input";
import { AuthGuard } from "@/shared/guards/auth-guard";
import { Permissions } from "@/shared/lib/permissions";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import { routerConfig } from "@/shared/router-config";

export default function AdminProblemsLayout() {
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
        breadcrumbs={[{ name: "Admin", url: "/admin" }, { name: "Problems" }]}
      >
        <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
          <Card className="col-span-12">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Problems</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link href={routerConfig.adminProblemPools.path}>
                    <Layers size={14} /> Manage pools
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link href={routerConfig.adminDailyChallenges.path}>
                    <CalendarDays size={14} /> Daily challenges
                  </Link>
                </Button>
                <AuthGuard
                  permission={Permissions.ADMIN_PROBLEMS_CREATE}
                  fallback={null}
                >
                  <Button size="sm" className="gap-1.5" asChild>
                    <Link href={routerConfig.adminProblemNew.path}>
                      <Plus size={14} /> New Problem
                    </Link>
                  </Button>
                </AuthGuard>
                <AdminProblemSearchInput />
              </div>
            </CardHeader>
            <CardContent>
              <AdminProblemsTable />
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}

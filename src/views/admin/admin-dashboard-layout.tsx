"use client";

import Link from "next/link";
import { FileCode, Puzzle, Swords, Users } from "lucide-react";
import { useAdminDashboardStats } from "@/domains/dashboard/api/get-admin-dashboard-stats";
import { StatTile } from "@/domains/dashboard/components/stat-tile";
import { NewUsersChart } from "@/domains/dashboard/components/new-users-chart";
import { FeedbackStatusChart } from "@/domains/dashboard/components/feedback-status-chart";
import { AuthGuard } from "@/shared/guards/auth-guard";
import { Permissions } from "@/shared/lib/permissions";
import { routerConfig } from "@/shared/router-config";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";

export default function AdminDashboardLayout() {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_DASHBOARD_READ}
      fallback={
        <NotFoundCard
          title="Page not found"
          description="We could not find the page you are looking for. It may have been removed, renamed, or the link is incorrect."
        />
      }
    >
      <SidebarLayout breadcrumbs={[{ name: "Admin" }]}>
        <AdminDashboardContent />
      </SidebarLayout>
    </AuthGuard>
  );
}

function AdminDashboardContent() {
  const { data } = useAdminDashboardStats();

  return (
    <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
      <div className="col-span-12 grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-4">
        <StatTile
          label="Users"
          value={data?.totalUsers}
          icon={Users}
          href={routerConfig.adminUsers.path}
        />
        <StatTile
          label="Problems"
          value={data?.totalProblems}
          icon={Puzzle}
          href={routerConfig.adminProblems.path}
        />
        <StatTile
          label="Games"
          value={data?.totalGames}
          icon={Swords}
          href={routerConfig.adminGames.path}
        />
        <StatTile
          label="Submissions"
          value={data?.totalSubmissions}
          icon={FileCode}
          href={routerConfig.adminSubmissions.path}
        />
      </div>

      <Card className="col-span-12 @3xl:col-span-7">
        <CardHeader>
          <CardTitle>New users</CardTitle>
        </CardHeader>
        <CardContent>
          {data ? (
            <NewUsersChart data={data.newUsersByDay} />
          ) : (
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          )}
        </CardContent>
      </Card>

      <Card className="col-span-12 @3xl:col-span-5">
        <CardHeader>
          <CardTitle>Feedback by status</CardTitle>
          <CardAction>
            <Button variant="ghost" size="sm" asChild>
              <Link href={routerConfig.adminFeedback.path}>View all</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {data ? (
            <FeedbackStatusChart data={data.feedbackByStatus} />
          ) : (
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

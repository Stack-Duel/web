"use client";

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
import { useUpcomingDailyChallenges } from "@/domains/daily-challenge/api/get-upcoming-daily-challenges";
import UpdateDailyChallengeDialog from "@/domains/daily-challenge/components/update-daily-challenge-dialog";
import DifficultyBadge from "@/domains/problem/components/difficulty-badge";
import AdminProblemStatusBadge from "@/domains/problem/components/admin-problem-status-badge";

export default function AdminDailyChallengesLayout() {
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
          { name: "Daily challenges" },
        ]}
      >
        <AdminDailyChallengesContent />
      </SidebarLayout>
    </AuthGuard>
  );
}

function AdminDailyChallengesContent() {
  const { data: upcoming, isLoading } = useUpcomingDailyChallenges();

  return (
    <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Upcoming daily challenges</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !upcoming || upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming daily challenges are scheduled yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {upcoming.map((challenge) => (
                <div
                  key={challenge.date}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                      {challenge.date}
                    </span>
                    <span className="font-medium">
                      {challenge.problemTitle}
                    </span>
                    <DifficultyBadge difficulty={challenge.difficultyTier} />
                    <AdminProblemStatusBadge status={challenge.status} />
                  </div>
                  <UpdateDailyChallengeDialog
                    date={challenge.date}
                    currentProblemTitle={challenge.problemTitle}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

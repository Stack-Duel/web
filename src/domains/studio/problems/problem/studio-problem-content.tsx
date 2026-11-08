"use client";

import { notFound } from "next/navigation";
import { Clock, Cpu, Layers, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import DifficultyBadge from "@/domains/problem/components/difficulty-badge";
import AdminProblemStatusBadge from "@/domains/problem/components/admin-problem-status-badge";
import { useSuspenseStudioProblemDetails } from "../../api/get-studio-problem";
import type { ProblemStatus } from "@/domains/problem/models/admin-problem";

type StudioProblemContentProps = {
  id: string;
};

export default function StudioProblemContent({
  id,
}: Readonly<StudioProblemContentProps>) {
  const { data } = useSuspenseStudioProblemDetails({ problemId: id });

  if (!data) {
    return notFound();
  }

  return (
    <div className="@container grid grid-cols-12 gap-4">
      <Card className="col-span-12">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="font-mono text-sm text-muted-foreground">
                {data.slug}
              </h2>
              <h1 className="text-lg font-semibold">{data.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={data.difficultyTier} />
              <AdminProblemStatusBadge status={data.status as ProblemStatus} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground flex-col @md:flex-row">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              Time Limit {data.timeLimitMs}ms
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="size-4" />
              Memory Limit {data.memoryLimitMb}MB
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="size-4" />
              {data.setupCount} setup{data.setupCount === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              Created on {new Date(data.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-12 flex flex-col gap-4 @md:flex-row">
        <Card className="flex-1">
          <CardContent className="flex flex-col gap-2">
            <h4 className="text-muted-foreground font-semibold">
              Total Attempts
            </h4>
            <p className="text-2xl font-semibold">{data.attemptCount}</p>
            <p className="text-xs text-muted-foreground">Since Published</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="flex flex-col gap-2">
            <h4 className="text-muted-foreground font-semibold">Solve Rate</h4>
            <p className="text-2xl font-semibold">{data.solveRatePercent}%</p>
            <p className="text-xs text-muted-foreground">
              Out of all submissions
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="flex flex-col gap-2">
            <h4 className="text-muted-foreground font-semibold">Reactions</h4>
            <p className="text-2xl font-semibold">{data.reactionCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

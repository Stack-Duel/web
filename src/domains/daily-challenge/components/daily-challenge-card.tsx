"use client";

import Link from "next/link";
import { Check, Sparkle } from "lucide-react";
import { useTodaysDailyChallenge } from "../api/get-todays-daily-challenge";
import type { TodaysDailyChallenge } from "../models/daily-challenge";
import DifficultyBadge from "@/domains/problem/components/difficulty-badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { routerConfig } from "@/shared/router-config";

type DailyChallengeCardProps = {
  className?: string;
};

type DailyChallengeCardBodyProps = {
  data: TodaysDailyChallenge | undefined;
  isLoading: boolean;
};

function DailyChallengeCardBody({
  data,
  isLoading,
}: Readonly<DailyChallengeCardBodyProps>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-9 w-24" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        No daily challenge available right now — check back soon.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{data.title}</span>
        <DifficultyBadge difficulty={data.difficultyTier} />
      </div>

      {data.solvedByCurrentUser ? (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check size={16} />
          Solved today
        </div>
      ) : (
        <Button asChild>
          <Link href={routerConfig.problem.execute({ slug: data.slug })}>
            Solve
          </Link>
        </Button>
      )}
    </div>
  );
}

export default function DailyChallengeCard({
  className,
}: Readonly<DailyChallengeCardProps>) {
  const { data, isLoading } = useTodaysDailyChallenge();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle className="size-4 text-muted-foreground" />
          Daily challenge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DailyChallengeCardBody data={data} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

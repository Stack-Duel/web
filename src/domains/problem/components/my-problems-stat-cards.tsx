"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useMyProblemsMetadata } from "../api/get-my-problems-metadata";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function MyProblemsStatCards() {
  const { data, isLoading } = useMyProblemsMetadata();

  const stats = [
    { label: "Total Submissions", value: data?.totalSubmissions ?? 0 },
    { label: "Total Reactions", value: data?.totalReactions ?? 0 },
    {
      label: "Avg. Completion Rate",
      value: formatPercent(data?.averageCompletionRate ?? 0),
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.label} className="col-span-12 @md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {isLoading ? "—" : stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

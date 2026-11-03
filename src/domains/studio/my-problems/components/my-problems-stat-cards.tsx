import { useMyProblemsMetadata } from "@/domains/problem/api/get-my-problems-metadata";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function MyProblemStatsCard() {
  const { data: metadata, isLoading } = useMyProblemsMetadata();

  const stats = [
    {
      label: "Total Submissions",
      value: metadata?.totalSubmissions ?? 0,
    },
    {
      label: "Total Reactions",
      value: metadata?.totalReactions ?? 0,
    },
    {
      label: "Avg. Completion Rate",
      value: Math.round((metadata?.averageCompletionRate ?? 0) * 100),
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

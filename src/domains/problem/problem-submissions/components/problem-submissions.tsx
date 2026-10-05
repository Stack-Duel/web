import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { InfinitePaginatedList } from "@/shared/pagination/pagination-list";
import { cn } from "@/shared/lib/utils";
import { ComponentProps } from "react";

import ProblemSubmissionsCard from "./problem-submissions-card";
import { Problem } from "../../models/problem";
import { useProblemSubmissions } from "../api/use-problem-submissions";
import { useProblemSubmissionsFilterStore } from "../state/problem-submissions-filter-store-context";

type ProblemSubmissionsProps = {
  problem: Problem;
  isAuthenticated: boolean;
} & ComponentProps<"div">;

export default function ProblemSubmissions({
  problem,
  isAuthenticated,
  className,
  ...props
}: Readonly<ProblemSubmissionsProps>) {
  const type = useProblemSubmissionsFilterStore((s) => s.type);
  const sortBy = useProblemSubmissionsFilterStore((s) => s.sortBy);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useProblemSubmissions({
      slug: problem.slug,
      type,
      sortBy,
      enabled: isAuthenticated,
    });

  const submissions = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <Card className={cn("h-fit", className)} {...props}>
      <CardHeader>
        <CardTitle>Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <InfinitePaginatedList
          items={submissions}
          hasMore={!!hasNextPage}
          isFetching={isLoading || isFetchingNextPage}
          scrollableTarget="sidebar-layout-content"
          emptyComponent={
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground text-sm">
                No submissions found.
              </p>
            </div>
          }
          onNext={() => {
            fetchNextPage();
          }}
          renderItem={(item) => <ProblemSubmissionsCard submission={item} />}
          getKey={(item) => item.id}
        />
      </CardContent>
    </Card>
  );
}

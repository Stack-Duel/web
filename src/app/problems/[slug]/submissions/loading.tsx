import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";

export default function ProblemSubmissionsLoading() {
  return (
    <SidebarLayout breadcrumbs={[]}>
      <div className="px-2 md:px-4 pb-2 md:pb-4">
        <div className="grid grid-cols-12 gap-3 h-full">
          <Card className="col-span-12 flex flex-col">
            <CardHeader className="gap-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </CardHeader>
          </Card>
          <Card className="col-span-9">
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}

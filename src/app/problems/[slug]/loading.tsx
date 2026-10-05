import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";

export default function ProblemLoading() {
  return (
    <SidebarLayout breadcrumbs={[]}>
      <div className="px-2 md:px-4 pb-2 md:pb-4">
        <div className="grid grid-cols-12 gap-3 h-full">
          <Card className="col-span-5 flex flex-col">
            <CardHeader className="gap-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </CardHeader>
            <CardContent className="grid gap-3 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
              <div className="grid gap-2 pt-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </CardContent>
          </Card>

          <Card className="col-span-7 flex flex-col">
            {/* Toolbar */}
            <CardHeader className="flex flex-row items-center gap-3 border-b pb-3">
              <Skeleton className="h-8 w-32 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
              <div className="ml-auto flex gap-2">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 gap-0 p-0">
              {/* Editor lines */}
              <div className="flex-1 p-4 grid gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-1/4 ml-6" />
                <Skeleton className="h-4 w-1/3 ml-6" />
                <Skeleton className="h-4 w-2/5 ml-6" />
                <Skeleton className="h-4 w-1/4" />
              </div>

              {/* Test cases panel */}
              <div className="border-t">
                <div className="flex items-center gap-3 px-4 py-2 border-b">
                  <Skeleton className="h-5 w-24 rounded" />
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
                <div className="p-4 grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}

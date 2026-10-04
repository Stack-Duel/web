import { Skeleton } from "@/shared/components/ui/skeleton";
import { TableCell, TableRow } from "@/shared/components/ui/table";

type DataTableSkeletonProps = {
  rowCount?: number;
  columnCount?: number;
};

export function DataTableSkeleton({
  rowCount = 5,
  columnCount = 3,
}: Readonly<DataTableSkeletonProps>) {
  return Array.from({ length: rowCount }).map((_, rowIndex) => (
    <TableRow key={`skeleton-row-${rowIndex}`}>
      {Array.from({ length: columnCount }).map((__, colIndex) => (
        <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
          <Skeleton className="h-5 w-full max-w-40" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

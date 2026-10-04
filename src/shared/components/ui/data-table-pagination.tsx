import { type Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Button } from "./button";

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  sizes?: number[];
  showSelectionSummary?: boolean;
}

export function DataTablePagination<TData>({
  table,
  sizes = [10, 20, 25, 30, 40, 50],
  showSelectionSummary = true,
}: Readonly<DataTablePaginationProps<TData>>) {
  const rowsPerPage = (
    <div className="flex items-center gap-2">
      <p className="hidden text-sm font-medium sm:block">Rows per page</p>
      <Select
        value={`${table.getState().pagination.pageSize}`}
        onValueChange={(value) => {
          table.setPageSize(Number(value));
        }}
      >
        <SelectTrigger
          className="h-8 w-14 sm:w-17.5"
          aria-label="Rows per page"
        >
          <SelectValue placeholder={table.getState().pagination.pageSize} />
        </SelectTrigger>
        <SelectContent side="top">
          {sizes.map((pageSize) => (
            <SelectItem key={pageSize} value={`${pageSize}`}>
              {pageSize}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="order-2 text-xs text-muted-foreground sm:order-1 sm:flex-1 sm:text-sm">
        {showSelectionSummary ? (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </>
        ) : (
          rowsPerPage
        )}
      </div>
      <div className="order-1 flex items-center justify-between gap-3 sm:order-2 sm:justify-end sm:gap-6 lg:gap-8">
        {showSelectionSummary ? rowsPerPage : null}
        <div className="flex items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1}
          {table.getPageCount() >= 0 ? (
            <>
              <span className="mx-1 sm:hidden">/</span>
              <span className="hidden sm:inline"> of </span>
              {table.getPageCount()}
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 md:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 md:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GlobalTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  title: string;
  description?: string;
  searchPlaceholder?: string;
  searchKey?: string;
  onRowClick?: (row: TData) => void;
  rowClickHref?: (row: TData) => string;
  stats?: Array<{
    label: string;
    value: string | number;
    description: string;
  }>;
}

export function GlobalTable<TData extends { id: string }>({
  data,
  columns,
  title,
  description,
  searchPlaceholder = "Search...",
  searchKey = "name",
  onRowClick,
  rowClickHref,
  stats,
}: GlobalTableProps<TData>) {
  const [searchTerm, setSearchTerm] = useState("");

  // Do not append action/edit columns. Rows are clickable via `onRowClick` or
  // `rowClickHref` (click a row to view details). Keep original columns
  // unchanged to avoid adding an actions column.
  const tableColumns = useMemo(() => [...columns], [columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: searchTerm,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(searchKey);
      return String(value).toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div
          className={`grid grid-cols-1 md:grid-cols-${Math.min(
            stats.length,
            3
          )} gap-4 mb-6`}
        >
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Showing {table.getRowModel().rows.length} records
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border w-full overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full table-auto">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={table.getAllLeafColumns().length}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        onClick={() => {
                          onRowClick?.(row.original);
                          if (rowClickHref) {
                            window.location.href = rowClickHref(row.original);
                          }
                        }}
                        className={
                          rowClickHref || onRowClick
                            ? "cursor-pointer hover:bg-muted"
                            : ""
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

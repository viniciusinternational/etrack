"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/global/global-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import numeral from "numeral";
import type { Revenue } from "./types";
import { formatDate } from "./utils";

export function RevenueListView({
  revenues,
}: {
  revenues: Revenue[];
}) {
  const stats = useMemo(() => {
    const total = revenues.length;
    const totalAmount = revenues.reduce((sum, r) => sum + r.amount, 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    return { total, totalAmount, avgAmount };
  }, [revenues]);
  const formatCompactNumber = (value: number): string => {
    return numeral(value).format("0.0a").toUpperCase();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Revenues</h1>
          <p className="text-muted-foreground mt-1">Manage MDA revenues</p>
        </div>
        <Link href="/revenue/add" className="w-full sm:w-auto">
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Revenue
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCompactNumber(stats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCompactNumber(stats.avgAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per record</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Table (Global TanStack Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Records</CardTitle>
          <CardDescription>Showing {revenues.length} records</CardDescription>
        </CardHeader>

        <CardContent>
          <GlobalTable
            data={revenues}
            columns={(() => {
              const cols: ColumnDef<Revenue>[] = [
                {
                  accessorKey: "type",
                  header: "Type",
                  cell: ({ row }) => (
                    <div className="font-medium">{row.original.type}</div>
                  ),
                },
                {
                  accessorKey: "mda.name",
                  header: "MDA",
                  cell: ({ row }) => (
                    <div className="text-sm">
                      {row.original.mda?.name || "N/A"}
                    </div>
                  ),
                },
                {
                  accessorKey: "amount",
                  header: "Amount",
                  cell: ({ row }) => (
                    <div className="font-semibold">
                      {formatCompactNumber(row.original.amount)}
                    </div>
                  ),
                },
                {
                  accessorKey: "date",
                  header: "Date",
                  cell: ({ row }) => (
                    <div className="text-sm">
                      {formatDate(row.original.date)}
                    </div>
                  ),
                },
                {
                  accessorKey: "supportingDocs",
                  header: "Docs",
                  cell: ({ row }) => (
                    <Badge variant="outline">
                      {row.original.supportingDocs.length}
                    </Badge>
                  ),
                },
              ];
              return cols;
            })()}
            title="Revenues"
            rowClickHref={(row) => `/revenue/${row.id}`}
          />
        </CardContent>
      </Card>
    </>
  );
}

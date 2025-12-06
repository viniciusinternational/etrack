"use client";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/global/global-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "./utils";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAwards } from "@/hooks/use-awards";
import numeral from "numeral";

export function AwardsListView() {
  const { data: awards, isLoading } = useAwards();

  const stats = useMemo(() => {
    if (!awards) return { total: 0, totalValue: 0 };
    const total = awards.length;
    const totalValue = awards.reduce((sum, a) => sum + a.contractValue, 0);
    return { total, totalValue };
  }, [awards]);
  const formatCompactNumber = (value: number): string => {
    return numeral(value).format("0.0a").toUpperCase();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Awards</h1>
          <p className="text-muted-foreground mt-1">
            View awarded contracts and vendors
          </p>
        </div>
        <Link href="/awards/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Award
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contract Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCompactNumber(stats.totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Awards Table (Global TanStack Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Awarded Contracts</CardTitle>
          <CardDescription>
            Showing {awards?.length || 0} awards
          </CardDescription>
        </CardHeader>

        <CardContent>
          <GlobalTable
            data={awards || []}
            columns={(() => {
              if (isLoading) return [];
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const cols: ColumnDef<any>[] = [
                {
                  accessorKey: "procurementRequest.title",
                  header: "Tender Title",
                  cell: ({ row }) => (
                    <div className="font-medium max-w-[250px]">
                      {row.original.procurementRequest?.title}
                    </div>
                  ),
                },
                {
                  accessorKey: "vendor.name",
                  header: "Awarded Vendor",
                  cell: ({ row }) => (
                    <div className="text-sm">{row.original.vendor?.name}</div>
                  ),
                },
                {
                  accessorKey: "contractValue",
                  header: "Contract Value",
                  cell: ({ row }) => (
                    <div className="font-semibold">
                      {formatCompactNumber(row.original.contractValue)}
                    </div>
                  ),
                },
                {
                  accessorKey: "awardDate",
                  header: "Award Date",
                  cell: ({ row }) => (
                    <div className="text-sm">
                      {formatDate(row.original.awardDate)}
                    </div>
                  ),
                },
              ];
              return cols;
            })()}
            title="Awards"
            rowClickHref={(row) => `/awards/${row.id}`}
          />
        </CardContent>
      </Card>
    </>
  );
}

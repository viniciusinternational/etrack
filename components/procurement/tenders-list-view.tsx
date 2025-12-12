"use client";
import { useMemo } from "react";
import Link from "next/link";

import type { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/global/global-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  getProcurementStatusConfig,
} from "./utils";
import numeral from "numeral";
import { useTenders } from "@/hooks/use-tenders";
import { useAuthStore } from "@/store/auth-store";
import { hasPermission } from "@/lib/permissions";

export function TendersListView() {
  const { data: tenders, isLoading } = useTenders();
  const { user } = useAuthStore();
  const canCreateTender = hasPermission(user as any, 'create_tender');

  const stats = useMemo(() => {
    if (!tenders)
      return { total: 0, open: 0, bidding: 0, awarded: 0, totalValue: 0 };

    const total = tenders.length;
    const open = tenders.filter((p) => p.status === "Open").length;
    const bidding = tenders.filter((p) => p.status === "Bidding").length;
    const awarded = tenders.filter((p) => p.status === "Awarded").length;
    const totalValue = tenders.reduce((sum, p) => sum + p.estimatedCost, 0);
    return { total, open, bidding, awarded, totalValue };
  }, [tenders]);
  const formatCompactNumber = (value: number): string => {
    return numeral(value).format("0.0a").toUpperCase();
  };
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tenders</h1>
          <p className="text-muted-foreground mt-1">
            Manage procurement tenders and bids
          </p>
        </div>
        {canCreateTender && (
          <Link href="/tenders/add">
            <Button>Create Tender</Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tenders
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
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bidding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">
              {stats.bidding}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awarded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">
              {stats.awarded}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCompactNumber(stats.totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenders Table (Global TanStack Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Procurement Tenders</CardTitle>
          <CardDescription>
            Showing {tenders?.length || 0} tenders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GlobalTable
            data={tenders || []}
            columns={(() => {
              if (isLoading) return [];
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const cols: ColumnDef<any>[] = [
                {
                  accessorKey: "title",
                  header: "Title",
                  cell: ({ row }) => (
                    <div className="font-medium max-w-[250px]">
                      {row.original.title}
                    </div>
                  ),
                },
                {
                  accessorKey: "mda.name",
                  header: "MDA",
                  cell: ({ row }) => (
                    <div className="text-sm">{row.original.mda?.name}</div>
                  ),
                },
                {
                  accessorKey: "estimatedCost",
                  header: "Estimated Cost",
                  cell: ({ row }) => (
                    <div className="font-semibold">
                      {formatCompactNumber(row.original.estimatedCost)}
                    </div>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }) => {
                    const statusConfig = getProcurementStatusConfig(
                      row.original.status
                    );
                    return (
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    );
                  },
                },
                {
                  accessorKey: "requestDate",
                  header: "Request Date",
                  cell: ({ row }) => (
                    <div className="text-sm">
                      {formatDate(row.original.requestDate)}
                    </div>
                  ),
                },
              ];
              return cols;
            })()}
            title="Tenders"
            rowClickHref={(row) => `/tenders/${row.id}`}
          />
        </CardContent>
      </Card>
    </>
  );
}
